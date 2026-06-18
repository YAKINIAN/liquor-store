document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user')) || {};
    document.getElementById('profileName').textContent = user.name || 'My Account';
    document.getElementById('profileRole').textContent = user.role === 'admin' ? '👑 Admin' : '👤 Customer';
    document.getElementById('nameInput').value = user.name || '';
    document.getElementById('emailInput').value = user.email || '';

    // Update cart count
    const cartSpan = document.querySelector('.cart-icon span');
    if (cartSpan) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartSpan.textContent = cart.reduce((t, i) => t + i.qty, 0);
    }

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const msg = document.getElementById('profileMsg');

        if (!name) {
            showMsg(msg, 'danger', 'Name cannot be empty');
            return;
        }
        if (newPassword && newPassword !== confirmPassword) {
            showMsg(msg, 'danger', 'Passwords do not match');
            return;
        }

        try {
            const body = { name };
            if (newPassword) body.password = newPassword;

            const res = await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                document.getElementById('profileName').textContent = name;
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                showMsg(msg, 'success', 'Profile updated successfully!');
            } else {
                showMsg(msg, 'danger', data.message || 'Update failed');
            }
        } catch (err) {
            showMsg(msg, 'danger', 'Cannot connect to server');
        }
    });

    function showMsg(el, type, text) {
        el.style.display = 'block';
        el.className = `alert alert-${type}`;
        el.textContent = text;
    }
});
