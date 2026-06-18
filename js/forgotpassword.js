document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const btn = form.querySelector('button[type=submit]');
        const msg = document.getElementById('forgotMsg');

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            msg.style.display = 'block';
            if (res.ok) {
                msg.className = 'alert alert-success mt-3';
                msg.textContent = data.message || 'If that email exists, a reset link has been sent.';
                form.reset();
            } else {
                msg.className = 'alert alert-danger mt-3';
                msg.textContent = data.message || 'Something went wrong. Please try again.';
            }
        } catch (err) {
            msg.style.display = 'block';
            msg.className = 'alert alert-danger mt-3';
            msg.textContent = 'Cannot connect to server. Please try again.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
        }
    });
});
