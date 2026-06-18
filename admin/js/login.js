document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in as admin
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_BASE}/api/auth/verify-admin`, {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => { if (r.ok) window.location.href = 'index.html'; }).catch(() => {});
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errEl = document.getElementById('loginError');
        errEl.style.display = 'none';

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                errEl.textContent = data.message || 'Login failed';
                errEl.style.display = 'block';
                return;
            }

            if (data.user?.role !== 'admin') {
                errEl.textContent = 'Access denied. Admin accounts only.';
                errEl.style.display = 'block';
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } catch (err) {
            errEl.textContent = 'Cannot connect to server';
            errEl.style.display = 'block';
        }
    });
});
