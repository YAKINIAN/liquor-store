// API Endpoint URL
const API_URL = `${API_BASE}/api/auth/users`;

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

// Load all users from DB
async function loadUsers() {
    const tableBody = document.getElementById("usersTableBody");
    if (!tableBody) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to load users list");

        const users = await res.json();
        
        // Update stats
        const statsEl = document.getElementById("totalUsersCount");
        if (statsEl) statsEl.textContent = users.length;

        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        No registered users found.
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        users.forEach(user => {
            const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
            
            // Format role badge
            const isAdmin = user.role === "admin";
            const badgeClass = isAdmin ? "bg-danger" : "bg-light text-dark border";

            html += `
                <tr>
                    <td class="font-monospace small">#${user._id.slice(-6).toUpperCase()}</td>
                    <td class="fw-semibold">${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge ${badgeClass} text-uppercase px-2 py-1">
                            ${user.role || "user"}
                        </span>
                    </td>
                    <td>${dateStr}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (err) {
        console.error("Load users error:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    Error loading users from server. Make sure you are logged in as an administrator.
                </td>
            </tr>
        `;
    }
}
