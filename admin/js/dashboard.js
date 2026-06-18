const PRODUCTS_API = `${API_BASE}/api/products`;
const ORDERS_API = `${API_BASE}/api/orders/all`;
const USERS_API = `${API_BASE}/api/auth/users`;

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

async function loadDashboardData() {
    const token = localStorage.getItem("token");

    try {
        // Fetch all data concurrently
        const [productsRes, ordersRes, usersRes] = await Promise.all([
            fetch(PRODUCTS_API),
            fetch(ORDERS_API, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(USERS_API, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (!productsRes.ok || !ordersRes.ok || !usersRes.ok) {
            throw new Error("Failed to load dashboard metrics");
        }

        const products = await productsRes.json();
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];
        const users = await usersRes.json();

        // 1. Update Counts
        document.getElementById("statProducts").textContent = products.length;
        document.getElementById("statOrders").textContent = orders.length;
        document.getElementById("statCustomers").textContent = users.length;

        // 2. Calculate Revenue (Only count paid or delivered orders)
        const totalRevenue = orders.reduce((sum, order) => {
            if (order.status === "paid" || order.status === "delivered") {
                const orderSubtotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.qty), 0);
                return sum + orderSubtotal + 200; // subtotal + Ksh 200 delivery fee
            }
            return sum;
        }, 0);
        document.getElementById("statRevenue").textContent = `KES ${totalRevenue.toLocaleString()}`;

        // 3. Render recent 5 orders
        const recentOrdersBody = document.getElementById("recentOrdersBody");
        if (recentOrdersBody) {
            if (orders.length === 0) {
                recentOrdersBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-3 text-muted">No orders placed yet.</td>
                    </tr>
                `;
                return;
            }

            const recent = orders.slice(0, 5);
            let html = "";
            
            recent.forEach(order => {
                const itemsStr = order.items.map(i => `${i.name} (${i.qty})`).join(", ");
                const sub = order.items.reduce((s, i) => s + (i.price * i.qty), 0) + 200;
                
                let badgeClass = "bg-secondary";
                if (order.status === "pending") badgeClass = "bg-warning text-dark";
                else if (order.status === "preparing") badgeClass = "bg-info text-dark";
                else if (order.status === "on-the-way") badgeClass = "bg-primary";
                else if (order.status === "delivered" || order.status === "paid") badgeClass = "bg-success";
                else if (order.status === "failed") badgeClass = "bg-danger";

                html += `
                    <tr>
                        <td class="font-monospace small">#${order._id.slice(-6).toUpperCase()}</td>
                        <td class="small text-muted font-monospace">#${(order.user || "").slice(-6).toUpperCase() || "GUEST"}</td>
                        <td class="small text-truncate" style="max-width: 250px;" title="${itemsStr}">${itemsStr}</td>
                        <td class="fw-semibold">KES ${sub.toLocaleString()}</td>
                        <td>
                            <span class="badge ${badgeClass} text-uppercase px-2 py-1">${order.status}</span>
                        </td>
                    </tr>
                `;
            });
            recentOrdersBody.innerHTML = html;
        }

    } catch (err) {
        console.error("Dashboard load error:", err);
        alert("Error loading dashboard metrics. Please log in again if session expired.");
    }
}
