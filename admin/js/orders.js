// API Endpoint URL
const API_URL = `${API_BASE}/api/orders`;

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});

// Load all orders from server
async function loadOrders() {
    const tableBody = document.getElementById("ordersTableBody");
    if (!tableBody) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to load orders");

        const data = await res.json();
        const orders = data.orders || [];

        updateOrderStats(orders);

        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        No orders have been placed yet.
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        orders.forEach(order => {
            // Render items list
            const itemsList = order.items.map(item => {
                return `<div class="small fw-semibold">• ${item.name} <span class="text-danger">x${item.qty}</span></div>`;
            }).join("");

            // Calculate subtotal
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const deliveryFee = order.delivery === "Pick from Store" ? 0 : 200;
            const total = subtotal + deliveryFee;

            // Format status badge
            let badgeClass = "bg-secondary";
            if (order.status === "pending") badgeClass = "bg-warning text-dark";
            else if (order.status === "preparing") badgeClass = "bg-info text-dark";
            else if (order.status === "on-the-way") badgeClass = "bg-primary";
            else if (order.status === "delivered") badgeClass = "bg-success";
            else if (order.status === "paid") badgeClass = "bg-success fw-bold";
            else if (order.status === "failed") badgeClass = "bg-danger";

            // Format payment details
            const payment = order.payment || {};
            const paymentHTML = payment.receipt ? `
                <div class="small text-success fw-bold">Code: ${payment.receipt}</div>
                <div class="small text-muted">Ph: ${payment.phone}</div>
                <div class="small text-muted">Amt: KES ${payment.amount}</div>
            ` : `<span class="badge bg-light text-dark border">Unpaid / Cash</span>`;

            html += `
                <tr>
                    <td class="font-monospace small">#${order._id.slice(-6).toUpperCase()}</td>
                    <td class="small">${new Date(order.createdAt).toLocaleString()}</td>
                    <td>${itemsList}</td>
                    <td class="small text-muted">${order.delivery || "Immediate"}</td>
                    <td class="fw-bold text-dark">KES ${total.toLocaleString()}</td>
                    <td>${paymentHTML}</td>
                    <td>
                        <span class="badge ${badgeClass} text-uppercase px-2 py-1" id="statusBadge-${order._id}">
                            ${order.status}
                        </span>
                    </td>
                    <td>
                        <select class="form-select form-select-sm" style="width: 130px;" onchange="updateStatus('${order._id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                            <option value="on-the-way" ${order.status === 'on-the-way' ? 'selected' : ''}>On the Way</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="failed" ${order.status === 'failed' ? 'selected' : ''}>Failed</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (err) {
        console.error("Load orders error:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    Error loading orders from server. Make sure you are authenticated.
                </td>
            </tr>
        `;
    }
}

// Update stats counters
function updateOrderStats(orders) {
    let pending = 0;
    let preparing = 0;
    let ontheway = 0;
    let finished = 0;

    orders.forEach(o => {
        if (o.status === "pending") pending++;
        else if (o.status === "preparing") preparing++;
        else if (o.status === "on-the-way") ontheway++;
        else if (o.status === "delivered" || o.status === "paid") finished++;
    });

    const pendingEl = document.getElementById("pendingOrdersCount");
    const preparingEl = document.getElementById("preparingOrdersCount");
    const onthewayEl = document.getElementById("onthewayOrdersCount");
    const deliveredEl = document.getElementById("deliveredOrdersCount");

    if (pendingEl) pendingEl.textContent = pending;
    if (preparingEl) preparingEl.textContent = preparing;
    if (onthewayEl) onthewayEl.textContent = ontheway;
    if (deliveredEl) deliveredEl.textContent = finished;
}

// Send PUT request to update status
async function updateStatus(orderId, newStatus) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();

        if (res.ok) {
            alert(`Order status updated to ${newStatus} successfully!`);
            
            // Update badge class dynamically
            const badge = document.getElementById(`statusBadge-${orderId}`);
            if (badge) {
                badge.className = "badge text-uppercase px-2 py-1";
                badge.textContent = newStatus;
                
                let badgeClass = "bg-secondary";
                if (newStatus === "pending") badgeClass = "bg-warning text-dark";
                else if (newStatus === "preparing") badgeClass = "bg-info text-dark";
                else if (newStatus === "on-the-way") badgeClass = "bg-primary";
                else if (newStatus === "delivered") badgeClass = "bg-success";
                else if (newStatus === "paid") badgeClass = "bg-success fw-bold";
                else if (newStatus === "failed") badgeClass = "bg-danger";
                
                badge.classList.add(...badgeClass.split(" "));
            }
            
            // Reload all to update stats count
            loadOrders();
        } else {
            alert("Error: " + (data.message || "Failed to update status"));
        }
    } catch (err) {
        console.error("Update status error:", err);
        alert("Server error. Could not connect to API.");
    }
}
