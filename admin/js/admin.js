document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Authentication required. Redirecting to login...");
        window.location.href = "../login.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/verify-admin`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("Access denied. Administrator privileges required.");
            window.location.href = "../login.html";
        } else {
            // Set legacy flag for backward compatibility
            localStorage.setItem("adminToken", "loggedIn");
            
            // Set up user profile header in admin dashboard if selector exists
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const adminUserEl = document.getElementById("adminUsername");
            if (adminUserEl) {
                adminUserEl.textContent = user.name || "Administrator";
            }
        }
    } catch (err) {
        console.error("Auth check error:", err);
        alert("Cannot connect to authentication server.");
        window.location.href = "../login.html";
    }
});

// Handle Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        window.location.href = "../index.html";
    });
}