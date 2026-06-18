// 🔒 Require login
document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // ✅ Only run app if logged in
    displayOrders();
    updateOrdersCount();

});

const container = document.getElementById("ordersContainer");

// ================= FETCH ORDERS FROM BACKEND =================
async function getOrders() {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        console.log("ORDERS FROM BACKEND:", data);

        if (!res.ok) {
            console.error("Failed to fetch orders:", data);
            return [];
        }

        return data.orders || [];

    } catch (error) {

        console.error("FETCH ORDERS ERROR:", error);
        return [];
    }
}

// DISPLAY ORDERS
async function displayOrders() {

    if (!container) return; // 🔥 prevent crash

    const orders = await getOrders();

    console.log("Rendering orders:", orders);

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <div style="font-size:60px;">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here</p>
                <a href="shop/shop.html" class="btn">Shop Now</a>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {

        let itemsHTML = "";
        let total = 0;

        (order.items || []).forEach(item => {
            total += item.price * item.qty;

            itemsHTML += `
                <div class="item">
                    <span>${item.name} x${item.qty}</span>
                    <span>Ksh ${item.price * item.qty}</span>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="order">

                <div class="order-top">
                    <div>
                        <strong>Order #${order._id.slice(-6)}</strong>
                        <small class="date">
                            ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                        </small>
                    </div>

                    <span class="status ${order.status}">
                        ${formatStatus(order.status)}
                    </span>

                </div>

                <div class="progress-bar">
                    <div class="progress ${order.status}"></div>
                </div>

                <div class="order-items">

                    ${itemsHTML}

                    <p class="delivery-info">
                        🚚 ${order.delivery || "Immediate Delivery"}
                    </p>

                </div>

                <p class="tracking">
                    ${getTrackingText(order.status)}
                </p>

                ${order.payment?.receipt ? `
                    <p class="receipt">
                        🧾 Receipt: ${order.payment.receipt}
                    </p>
                ` : ""}

                <div class="order-bottom">
                    <strong>Total: Ksh ${total + (order.delivery === "Pick from Store" ? 0 : 200)}</strong>
                    <div style="display:flex; gap:8px;">
                        <button onclick="reorder('${order._id}')">Reorder</button>
                        ${order.status === "paid" || order.payment?.receipt ? `<button onclick='downloadReceipt(${JSON.stringify(order)})' style="background:transparent; border:1px solid var(--gold, #d4af37); color:var(--gold, #d4af37); border-radius:6px; padding:6px 14px; font-size:12px; cursor:pointer;"><i class="fa fa-download"></i> Receipt</button>` : ""}
                    </div>
                </div>

            </div>
        `;
    });
}

function getTrackingText(status) {
    if (status === "pending") return "Order received";
    if (status === "preparing") return "Preparing your drinks 🍸";
    if (status === "on-the-way") return "Rider is heading to you 🚚";
    if (status === "delivered") return "Delivered successfully ✅";
}

function formatStatus(status) {
    if (status === "pending") return "Pending";
    if (status === "preparing") return "Preparing";
    if (status === "on-the-way") return "On the Way";
    if (status === "delivered") return "Delivered";
    return status;
}

// ================= GET ORDERS COUNT FROM BACKEND =================
async function getOrdersCount() {
    const orders = await getOrders();
    return orders.length;
}

// ================= UPDATE COUNT =================
async function updateOrdersCount() {
    const countEl = document.getElementById("ordersCount");
    if (!countEl) return;

    const orders = await getOrders(); // ✅ now valid
    countEl.innerText = orders.length;
}

async function reorder(orderId) {

    const orders = await getOrders();
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    localStorage.setItem("cart", JSON.stringify(order.items));
    window.location.href = "cart.html";
}

function downloadReceipt(order) {
    const payment  = order.payment || {};
    const shortId  = (order._id || "").slice(-8).toUpperCase();
    const delivery = order.delivery === "Pick from Store" ? 0 : 200;
    const orderDate = new Date(order.createdAt);
    const dateStr  = orderDate.toLocaleDateString("en-KE", { year:"numeric", month:"long", day:"numeric" });
    const timeStr  = orderDate.toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" });
    const fulfillType = order.delivery === "Pick from Store" ? "PICK-UP" : "DELIVERY";

    let subtotal = 0;
    let itemRows = "";
    (order.items || []).forEach(item => {
        const line = item.price * item.qty;
        subtotal += line;
        itemRows += `<tr>
            <td style="padding:5px 0;font-size:13px;color:#222;">${item.name}</td>
            <td style="padding:5px 0;font-size:13px;color:#555;text-align:center;">x${item.qty}</td>
            <td style="padding:5px 0;font-size:13px;color:#222;text-align:right;font-weight:600;">KES ${line.toLocaleString()}</td>
        </tr>`;
    });

    const total = subtotal + delivery;
    const dash  = `<div style="border-top:1px dashed #bbb;margin:10px 0;"></div>`;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <div style="width:360px;margin:0 auto;font-family:'Courier New',Courier,monospace;background:#fff;padding:32px 28px;color:#111;">
        <div style="text-align:center;margin-bottom:4px;">
            <div style="font-size:38px;line-height:1;">🍷</div>
            <div style="font-size:22px;font-weight:900;letter-spacing:4px;color:#b8860b;margin-top:4px;font-family:Georgia,serif;">LIQUOR STORE</div>
            <div style="font-size:10px;letter-spacing:2px;color:#888;margin-top:2px;">PREMIUM SPIRITS · NAIROBI</div>
        </div>
        ${dash}
        <div style="text-align:center;font-size:11px;color:#555;line-height:1.7;">
            <div>📍 Nairobi, Kenya</div>
            <div>📞 +254 700 000 000</div>
            <div>🌐 liquorstore.co.ke</div>
        </div>
        ${dash}
        <table style="width:100%;font-size:12px;color:#444;">
            <tr><td style="padding:2px 0;">DATE</td><td style="text-align:right;color:#111;font-weight:700;">${dateStr}</td></tr>
            <tr><td style="padding:2px 0;">TIME</td><td style="text-align:right;color:#111;font-weight:700;">${timeStr}</td></tr>
            <tr><td style="padding:2px 0;">ORDER #</td><td style="text-align:right;color:#111;font-weight:700;">${shortId}</td></tr>
            <tr><td style="padding:2px 0;">${fulfillType}</td><td style="text-align:right;color:#111;font-weight:700;max-width:180px;word-break:break-word;">${order.delivery || "—"}</td></tr>
        </table>
        ${dash}
        <table style="width:100%;font-size:11px;color:#888;">
            <tr>
                <th style="text-align:left;font-weight:600;padding-bottom:4px;">ITEM</th>
                <th style="text-align:center;font-weight:600;padding-bottom:4px;">QTY</th>
                <th style="text-align:right;font-weight:600;padding-bottom:4px;">AMOUNT</th>
            </tr>
        </table>
        <div style="border-top:1px solid #ccc;margin-bottom:4px;"></div>
        <table style="width:100%;">${itemRows}</table>
        ${dash}
        <table style="width:100%;font-size:13px;color:#444;">
            <tr><td style="padding:3px 0;">SUBTOTAL</td><td style="text-align:right;">KES ${subtotal.toLocaleString()}</td></tr>
            <tr><td style="padding:3px 0;">DELIVERY FEE</td><td style="text-align:right;">KES ${delivery.toLocaleString()}</td></tr>
        </table>
        <div style="border-top:2px solid #111;margin:8px 0;"></div>
        <table style="width:100%;">
            <tr>
                <td style="font-size:15px;font-weight:900;color:#111;">TOTAL PAID</td>
                <td style="text-align:right;font-size:15px;font-weight:900;color:#b8860b;">KES ${total.toLocaleString()}</td>
            </tr>
        </table>
        ${dash}
        <div style="font-size:12px;color:#555;line-height:1.8;">
            <div style="font-weight:700;color:#111;letter-spacing:1px;margin-bottom:4px;">PAYMENT METHOD</div>
            <div>METHOD &nbsp;&nbsp;: M-PESA</div>
            <div>PHONE &nbsp;&nbsp;&nbsp;: ${payment.phone || "—"}</div>
            <div>RECEIPT &nbsp;: <span style="color:#b8860b;font-weight:700;">${payment.receipt || "—"}</span></div>
            <div>STATUS &nbsp;&nbsp;: <span style="color:green;font-weight:700;">✔ PAID</span></div>
        </div>
        ${dash}
        <div style="text-align:center;margin:10px 0;">
            <div style="font-size:42px;letter-spacing:-1px;line-height:1;color:#111;font-family:'Courier New',monospace;">▌▌█▌▌▌█▌▌██▌▌█▌███▌▌█▌▌</div>
            <div style="font-size:10px;color:#888;letter-spacing:2px;margin-top:4px;">${shortId}</div>
        </div>
        ${dash}
        <div style="text-align:center;font-size:11px;color:#888;line-height:2;">
            <div style="font-weight:700;color:#b8860b;font-size:12px;">THANK YOU FOR YOUR ORDER!</div>
            <div>Drink responsibly. Must be 18+</div>
            <div>For support: support@liquorstore.co.ke</div>
            <div style="margin-top:6px;font-size:10px;color:#bbb;">*** OFFICIAL RECEIPT ***</div>
        </div>
    </div>`;

    // Measure actual height before generating PDF
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    document.body.appendChild(wrapper);
    const contentPx = wrapper.scrollHeight;
    document.body.removeChild(wrapper);

    const heightMm = Math.ceil(contentPx * 0.2646) + 10;

    const wrapper2 = document.createElement("div");
    wrapper2.innerHTML = wrapper.innerHTML;

    html2pdf().set({
        margin:      0,
        filename:    `receipt-${shortId}.pdf`,
        image:       { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, backgroundColor: "#fff", useCORS: true },
        jsPDF:       { unit: "mm", format: [100, heightMm], orientation: "portrait" },
        pagebreak:   { mode: "avoid-all" }
    }).from(wrapper2).save();
}

