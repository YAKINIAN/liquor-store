const axios = require("axios");
const Order = require("../models/Order");

// Load from environment variables
const consumerKey = process.env.MPESA_CONSUMER_KEY || "JsppRxN0EJhOkybLVVda2WnUdTPEBBq7YcMkivvbAv41LMGR";
const consumerSecret = process.env.MPESA_CONSUMER_SECRET || "bzpT9sZBkLspNNwoVvdtaBu43S0h0rPZFjHsQI0bi8GlxihD87doItCzgWXuCzFT";

// SANDBOX DEFAULTS
const shortcode = process.env.MPESA_SHORTCODE || "174379";
const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

// ================= TIMESTAMP =================
function getTimestamp() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// ================= TOKEN =================
async function getAccessToken() {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const auth = Buffer
        .from(`${consumerKey}:${consumerSecret}`)
        .toString("base64");

    const response = await axios.get(url, {
        headers: {
            Authorization: `Basic ${auth}`
        }
    });

    return response.data.access_token;
}

// ================= STK PUSH =================
exports.stkPush = async (req, res) => {

    try {

        let { phone, amount, orderId } = req.body;

        console.log("📲 REQUEST:", phone, amount);

        // Format phone
        if (phone.startsWith("0")) {
            phone = "254" + phone.slice(1);
        }
        if (phone.startsWith("+254")) {
            phone = phone.replace("+", "");
        }

        // 🔥 Fetch and verify order from database to prevent price tampering
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Calculate actual total cost securely on the backend
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const deliveryFee = order.delivery === "Pick from Store" ? 0 : 200;
        const totalAmount = subtotal + deliveryFee;

        console.log(`💰 SECURE AMOUNT CALCULATION - Input: ${amount}, DB Verified Total: ${totalAmount} (Delivery Fee: ${deliveryFee})`);

        const token = await getAccessToken();

        const timestamp = getTimestamp();

        const password = Buffer
            .from(shortcode + passkey + timestamp)
            .toString("base64");

        console.log("🔐 PASSWORD:", password);
        console.log("🕒 TIMESTAMP:", timestamp);

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: totalAmount, // 🔥 Securely calculated total
                PartyA: phone,
                PartyB: shortcode,
                PhoneNumber: phone,
                CallBackURL: process.env.MPESA_CALLBACK_URL || "https://reappoint-karate-scapegoat.ngrok-free.dev/api/mpesa/callback",
                AccountReference: "LiquorStore",
                TransactionDesc: "Order Payment"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("✅ STK SUCCESS:", response.data);

        const stkResponse = response.data;

        // 🔥 Save CheckoutRequestID to latest order
        order.checkoutRequestID = stkResponse.CheckoutRequestID;
        await order.save();

        console.log("✅ Linked STK to Order:", order._id);

        res.json(response.data);

    } catch (error) {
        console.error("❌ STK ERROR:", error.response?.data || error.message);

        const errData = error.response?.data;
        let userMessage = "STK push failed";

        if (errData && errData.fault?.detail?.errorcode === "policies.ratelimit.SpikeArrestViolation") {
            userMessage = "M-Pesa system is temporarily busy (rate limit). Please wait 15 seconds and try again.";
        }

        res.status(500).json({
            message: userMessage,
            error: errData || error.message
        });
    }
};

// ================= CALLBACK HANDLER =================
exports.handleCallback = async (req, res) => {
    try {
        console.log("📥 FULL CALLBACK:", JSON.stringify(req.body, null, 2));

        const callback = req.body.Body?.stkCallback;
        if (!callback) {
            console.log("⚠️ No callback body");
            return res.json({ message: "No callback data" });
        }

        // ❌ Payment failed
        if(callback.ResultCode !== 0) {

            console.log("❌ PAYMENT FAILED:", callback.ResultDesc);

            const order = await Order.findOne({
                checkoutRequestID: callback.CheckoutRequestID
            });

            if (order) {
                order.status = "failed";
                order.payment = {
                    error: callback.ResultDesc
                };
                await order.save();

                console.log("❌ ORDER MARKED FAILED:", order._id);
            }

            return res.json({ message: "Payment failed" });
        }

        // ✅ Extract metadata
        const metadata = callback.CallbackMetadata.Item;

        const amount = metadata.find(i => i.Name === "Amount")?.Value;
        const receipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
        const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value;

        console.log("✅ PAYMENT SUCCESS");
        console.log("💰 Amount:", amount);
        console.log("🧾 Receipt:", receipt);
        console.log("📱 Phone:", phone);

        // ================= LINK PAYMENT TO ORDER =================
        // 🔥 Match using CheckoutRequestID
        const order = await Order.findOne({
            checkoutRequestID: callback.CheckoutRequestID
        });

        if (order) {
            order.status = "paid";
            order.payment = {
                receipt,
                phone,
                amount
            };

            await order.save();

            console.log("✅ ORDER MARKED AS PAID:", order._id);
        } else {
            console.log("⚠️ Order NOT FOUND for CheckoutRequestID:", callback.CheckoutRequestID);
        }

        res.json({ message: "Callback processed successfully" });

    } catch (error) {
        console.error("❌ CALLBACK ERROR:", error);
        res.status(500).json({ message: "Callback error" });
    }
};

// ================= STK PUSH QUERY =================
exports.stkQuery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.json({ status: order.status, message: order.payment?.error || "" });
    } catch (error) {
        console.error("❌ STK QUERY ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= MANUAL PAYMENT CONFIRM =================
// Called when user confirms they received M-Pesa success message
exports.confirmPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status === "paid") {
            return res.json({ status: "paid" });
        }

        // Mark as paid with manual confirmation flag
        order.status = "paid";
        order.payment = order.payment || {};
        order.payment.receipt = order.payment.receipt || "MANUAL-CONFIRM";
        order.payment.phone = order.payment.phone || req.user?.phone || "";
        await order.save();

        console.log(`✅ Order ${orderId} manually confirmed as PAID by user`);
        return res.json({ status: "paid" });
    } catch (error) {
        console.error("❌ CONFIRM ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};