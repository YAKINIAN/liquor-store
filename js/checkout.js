let globalTotal = 0;

function removeCheckoutItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => String(item.id) !== String(id));
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof window.updateNavCartCount === "function") window.updateNavCartCount();
    // Re-render the summary
    const itemsContainer = document.getElementById("checkoutItems");
    itemsContainer.innerHTML = "";
    cartSubtotal = 0;
    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p class="text-center text-muted">Your cart is empty 🛒</p>`;
        document.getElementById("subtotal").innerText = "KES 0";
        globalTotal = 0;
        updateTotals();
        document.getElementById("placeOrderBtn").disabled = true;
        return;
    }
    cart.forEach(item => {
        cartSubtotal += item.price * item.qty;
        itemsContainer.innerHTML += `
            <p class="d-flex justify-content-between align-items-center" style="padding: 12px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0;">
                <span style="flex: 1; min-width: 0; padding-right: 15px; color: #fff; font-weight: 500; text-align: left;">${item.name}</span>
                <span style="color: var(--text-muted); font-size: 13px; margin-right: 20px; white-space: nowrap;">Qty: ${item.qty}</span>
                <span style="color: var(--gold); font-weight: 600; white-space: nowrap;">KES ${(item.price * item.qty).toLocaleString()}</span>
            </p>
        `;
    });
    document.getElementById("subtotal").innerText = `KES ${cartSubtotal}`;
    updateTotals();
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function showCheckoutError(msg) {
    // Reuse the paymentError element or create a toast
    const el = document.getElementById("paymentError");
    if (el) {
        el.textContent = msg;
        el.style.display = "block";
        setTimeout(() => { el.style.display = "none"; }, 4000);
    } else if (typeof showToast === "function") {
        showToast(msg, "error");
    }
}

function validateFormLive() {

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const payment = document.getElementById("paymentMethod").value;
    const fulfillment = document.getElementById("fulfillmentMethod").value;

    let addressValid = true;
    if (fulfillment === "delivery") {
        const address = document.getElementById("address").value.trim();
        addressValid = !!address;
    } else if (fulfillment === "pickup") {
        addressValid = true;
    } else {
        addressValid = false;
    }

    const button = document.getElementById("placeOrderBtn");

    if (fullName && phone.length === 12 && addressValid && payment === "mpesa") {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

function setButtonLoading(isLoading) {

    const btn = document.getElementById("placeOrderBtn");
    const text = document.getElementById("btnText");

    if (!btn || !text) return;

    if (isLoading) {
        btn.disabled = true;
        text.innerHTML = "Processing...";
    } else {
        btn.disabled = false;
        text.innerHTML = "Place Order";
    }
}

function showPaymentModal() {
    const box = document.getElementById("paymentStatus");
    box.innerHTML = `
        <div class="spinner"></div>
        <h3>Waiting for Payment</h3>
        <p>Check your phone and enter your M-Pesa PIN to complete payment.</p>
    `;
    document.getElementById("paymentModal").style.display = "flex";

    // After 20s show manual confirm button for users who already paid
    setTimeout(() => {
        const h3 = document.querySelector("#paymentStatus h3");
        if (h3 && h3.textContent === "Waiting for Payment") {
            document.querySelector("#paymentStatus p").textContent =
                "If you already received a success SMS, tap the button below.";
            const btn = document.createElement("button");
            btn.textContent = "✅ I've Already Paid";
            btn.className = "btn btn-gold btn-sm mt-3";
            btn.onclick = manualConfirmPayment;
            document.getElementById("paymentStatus").appendChild(btn);
        }
    }, 20000);
}

function updatePaymentUI(status, message) {

    const box = document.getElementById("paymentStatus");

    if (status === "success") {
        box.innerHTML = `
            <div style="font-size:40px;">✅</div>
            <h3>Payment Successful</h3>
            <p>Redirecting...</p>
        `;
    }

    if (status === "failed") {
        box.innerHTML = `
            <div style="font-size:40px;">❌</div>
            <h3>Payment Failed</h3>
            <p>${message || "Please try again"}</p>
            <button onclick="retryPayment()" class="btn btn-gold btn-sm mt-3">Retry</button>
        `;
    }
}

let cartSubtotal = 0;

function updateTotals() {
    const fulfillmentSelect = document.getElementById("fulfillmentMethod");
    if (!fulfillmentSelect) return;
    const fulfillment = fulfillmentSelect.value;
    
    let deliveryFee = 0;
    let deliveryText = "KES 0";
    
    if (fulfillment === "delivery") {
        deliveryFee = 200;
        deliveryText = "KES 200";
    } else if (fulfillment === "pickup") {
        deliveryFee = 0;
        deliveryText = "Free";
    } else {
        deliveryFee = 0;
        deliveryText = "Select Option";
    }
    
    const total = cartSubtotal + deliveryFee;
    globalTotal = total;

    const deliveryFeeEl = document.getElementById("deliveryFee");
    if (deliveryFeeEl) {
        deliveryFeeEl.innerText = deliveryText;
    }
    const totalEl = document.getElementById("total");
    if (totalEl) {
        totalEl.innerText = `KES ${total}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const cart = getCart();

    const itemsContainer = document.getElementById("checkoutItems");

    let subtotal = 0;

    if (cart.length === 0) {

        itemsContainer.innerHTML = `
            <p class="text-center text-muted">
                Your cart is empty 🛒
            </p>
        `;

        document.getElementById("subtotal").innerText = "KES 0";
        document.getElementById("total").innerText = "KES 0";
        const feeEl = document.getElementById("deliveryFee");
        if (feeEl) feeEl.innerText = "KES 0";

        return;
    }

    cart.forEach(item => {

        subtotal += item.price * item.qty;

        itemsContainer.innerHTML += `
            <p class="d-flex justify-content-between align-items-center" style="padding: 12px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0;">
                <span style="flex: 1; min-width: 0; padding-right: 15px; color: #fff; font-weight: 500; text-align: left;">${item.name}</span>
                <span style="color: var(--text-muted); font-size: 13px; margin-right: 20px; white-space: nowrap;">Qty: ${item.qty}</span>
                <span style="color: var(--gold); font-weight: 600; white-space: nowrap;">KES ${(item.price * item.qty).toLocaleString()}</span>
            </p>
        `;
    });

    cartSubtotal = subtotal;

    document.getElementById("subtotal").innerText = `KES ${subtotal}`;
    updateTotals();

    const fulfillmentSelect = document.getElementById("fulfillmentMethod");
    const addressGroup = document.getElementById("deliveryAddressGroup");
    const scheduleGroup = document.getElementById("scheduleDeliveryGroup");

    if (fulfillmentSelect && addressGroup && scheduleGroup) {
        fulfillmentSelect.addEventListener("change", () => {
            const value = fulfillmentSelect.value;
            if (value === "pickup") {
                addressGroup.style.display = "none";
                scheduleGroup.style.display = "none";
                document.getElementById("address").value = "Pick from Store";
            } else {
                addressGroup.style.display = "block";
                scheduleGroup.style.display = "block";
                if (document.getElementById("address").value === "Pick from Store") {
                    document.getElementById("address").value = "";
                }
            }
            updateTotals();
            validateFormLive();
        });
    }

    const scheduleCheckbox =
        document.getElementById("scheduleDelivery");

    const scheduleFields =
        document.getElementById("scheduleFields");

    const deliveryDate =
        document.getElementById("deliveryDate");

    const today =
        new Date().toISOString().split("T")[0];

    if (deliveryDate) {
        deliveryDate.min = today;
    }

    if (scheduleCheckbox && scheduleFields) {
        scheduleCheckbox.addEventListener("change", () => {
            scheduleFields.style.display =
                scheduleCheckbox.checked
                    ? "block"
                    : "none";
        });
    }
});

// PLACE ORDER
document.addEventListener("DOMContentLoaded", () => {

    const checkoutForm = document.getElementById("checkoutForm");

    const savedUser = JSON.parse(localStorage.getItem("checkoutUser"));

    if (savedUser) {
        document.getElementById("fullName").value = savedUser.fullName || "";
        document.getElementById("phoneNumber").value = savedUser.phone || "";
        document.getElementById("address").value = savedUser.address || "";
    }

    if (!checkoutForm) return;

    checkoutForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setButtonLoading(true);

        // 🔥 READ USER INPUTS
        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phoneNumber").value.trim();
        const address = document.getElementById("address").value.trim();
        const paymentMethod = document.getElementById("paymentMethod").value;

        // 🔥 VALIDATION
        // 🔥 CLEAR OLD ERRORS
        document.getElementById("fullNameError").innerText = "";
        document.getElementById("phoneError").innerText = "";
        document.getElementById("addressError").innerText = "";
        document.getElementById("paymentError").innerText = "";

        let hasError = false;

        // 🔥 VALIDATION
        if (!fullName) {
            document.getElementById("fullNameError").innerText = "Full name is required";
            hasError = true;
        }

        if (!phone) {
            document.getElementById("phoneError").innerText = "Phone number is required";
            hasError = true;
        }

        if (!address) {
            document.getElementById("addressError").innerText = "Address is required";
            hasError = true;
        }

        if (!paymentMethod) {
            document.getElementById("paymentError").innerText = "Select a payment method";
            hasError = true;
        }

        const fulfillment = document.getElementById("fulfillmentMethod").value;
        if (!fulfillment) {
            document.getElementById("paymentError").innerText = "Select delivery or pick from store";
            hasError = true;
        }

        if (paymentMethod && paymentMethod !== "mpesa") {
            document.getElementById("paymentError").innerText = "Only M-Pesa supported";
            hasError = true;
        }

        // 🔥 STOP IF ERROR
        if (hasError) {

            const form = document.getElementById("checkoutForm");

            form.classList.add("shake");

            setTimeout(() => {
                form.classList.remove("shake");
            }, 300);

            setButtonLoading(false);
            return;
        }

        // 🔥 SAVE USER DETAILS
        localStorage.setItem("checkoutUser", JSON.stringify({
            fullName,
            phone,
            address
        }));

        let deliveryInfo = "Immediate Delivery";

        if (fulfillment === "pickup") {
            deliveryInfo = "Pick from Store";
        } else {
            const scheduled =
                document.getElementById("scheduleDelivery").checked;

            if (scheduled) {

                const date =
                    document.getElementById("deliveryDate").value;

                const slot =
                    document.getElementById("deliveryTime").value;

                if (!date || !slot) {
                    showCheckoutError("Please select a delivery date and time slot.");
                    setButtonLoading(false);
                    return;
                }

                deliveryInfo = `Scheduled for ${date} (${slot})`;
            }
        }

        const cart = getCart();

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                localStorage.setItem("redirectAfterLogin", "checkout.html");
                window.location.href = "login.html";
                return;
            }

            console.log("📤 Sending order to backend...");

            const res = await fetch(`${API_BASE}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    delivery: deliveryInfo
                })
            });

            console.log("📥 Response received:", res);

            const data = await res.json();

            console.log("ORDER RESPONSE:", data);

            if (res.ok) {

                setButtonLoading(false);

                const order = data.order; // 👈 important

                // 🔥 SHOW PAYMENT UI
                showPaymentModal();

                const token = localStorage.getItem("token");

                console.log("💰 FINAL AMOUNT:", globalTotal);

                // Call Mpesa / STK Push

                const mpesaRes = await fetch(`${API_BASE}/api/mpesa/stkpush`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        phone: phone,
                        amount: globalTotal,
                        orderId: order._id
                    })
                });

                const mpesaData = await mpesaRes.json();

                console.log("MPESA RESPONSE:", mpesaData);

                if (mpesaRes.ok) {
                    window._currentOrderId = order._id;
                    startPaymentCheck(order._id);
                } else {
                    setButtonLoading(false);
                    document.getElementById("paymentModal").style.display = "none";
                    showCheckoutError(mpesaData.message || "M-Pesa payment initiation failed.");
                }

            } else {
                setButtonLoading(false);
                showCheckoutError(data.message || "Order failed. Please try again.");
            }

        } catch (error) {
            console.error("ORDER ERROR:", error);
            setButtonLoading(false);
            showCheckoutError("Server error. Please check your connection.");
        }

    });

    // 🔥 AUTO FORMAT PHONE NUMBER
    const phoneInput = document.getElementById("phoneNumber");

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {

            let value = phoneInput.value.replace(/\D/g, ""); // remove non-digits

            // Convert 07XXXXXXXX → 2547XXXXXXXX
            if (value.startsWith("0")) {
                value = "254" + value.substring(1);
            }

            // Limit to 12 digits (254XXXXXXXXX)
            if (value.length > 12) {
                value = value.slice(0, 12);
            }

            phoneInput.value = value;
        });
    }

    // 🔥 LIVE VALIDATION EVENTS
    ["fullName", "phoneNumber", "address", "paymentMethod", "fulfillmentMethod"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", validateFormLive);
            el.addEventListener("change", validateFormLive);
        }
    });

});

let paymentInterval;

function startPaymentCheck(orderId) {

    let attempts = 0;
    const maxAttempts = 120; // 120 seconds — sandbox callbacks can be slow

    paymentInterval = setInterval(async () => {

        attempts++;

        console.log(`🔄 Checking payment status for order: ${orderId}...`);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/api/mpesa/status/${orderId}`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });

            if (!res.ok) {
                console.error("Error querying payment status:", res.status);
                return;
            }

            const data = await res.json();

            // ✅ PAYMENT SUCCESS
            if (data.status === "paid") {

                clearInterval(paymentInterval);

                updatePaymentUI("success");

                localStorage.removeItem("cart");

                setTimeout(() => {
                    window.location.href = `success.html?orderId=${orderId}`;
                }, 2000);
                return;
            }

            // ❌ Payment Failed
            if (data.status === "failed") {

                clearInterval(paymentInterval);

                updatePaymentUI("failed", data.message);
                return;
            }

        } catch (err) {
            console.error("Error polling payment status:", err);
        }

        // ⛔ STOP AFTER 60 SECONDS
        if (attempts >= maxAttempts) {

            clearInterval(paymentInterval);

            updatePaymentUI("failed", "Payment timed out. Please try again.");

            console.log("⏹ Payment timeout → treated as failed");
        }

    }, 1000);
}

function retryPayment() {
    document.getElementById("paymentModal").style.display = "none";
}

async function manualConfirmPayment() {
    const orderId = window._currentOrderId;
    if (!orderId) return;

    clearInterval(paymentInterval);

    const box = document.getElementById("paymentStatus");
    box.innerHTML = `<div class="spinner"></div><h3>Confirming...</h3>`;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/api/mpesa/confirm/${orderId}`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        if (data.status === "paid") {
            updatePaymentUI("success");
            localStorage.removeItem("cart");
            setTimeout(() => {
                window.location.href = `success.html?orderId=${orderId}`;
            }, 2000);
        }
    } catch (err) {
        console.error("Manual confirm error:", err);
        box.innerHTML = `<p style="color:#ff4d4d">Could not confirm. Please contact support.</p>`;
    }
}