document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const btn = e.target.querySelector("button[type=submit]");
    const msg = document.getElementById("signupMsg");

    if (password !== confirmPassword) {
        showMsg(msg, "danger", "Passwords do not match");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (res.ok) {
            showMsg(msg, "success", "Account created! Redirecting to login...");
            setTimeout(() => window.location.href = "login.html", 1500);
        } else {
            showMsg(msg, "danger", data.message || "Signup failed");
            btn.disabled = false;
            btn.textContent = "Create Account";
        }
    } catch (err) {
        showMsg(msg, "danger", "Cannot connect to server");
        btn.disabled = false;
        btn.textContent = "Create Account";
    }
});

function showMsg(el, type, text) {
    if (!el) return;
    el.style.display = "block";
    el.className = `alert alert-${type}`;
    el.textContent = text;
}
