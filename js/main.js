// ================= TOAST =================
function showToast(message, type = "success") {
    let toast = document.getElementById("siteToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "siteToast";
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:99999;
            padding:14px 22px;border-radius:10px;font-size:15px;font-weight:600;
            box-shadow:0 6px 24px rgba(0,0,0,0.4);transition:all 0.4s;
            opacity:0;pointer-events:none;transform:translateY(10px);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = type === "success" ? "#1b1b1b" : "#dc3545";
    toast.style.color = type === "success" ? "#d4af37" : "#fff";
    toast.style.border = `1px solid ${type === "success" ? "rgba(212,175,55,0.4)" : "#dc3545"}`;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
    }, 3000);
}

// ================= CART COUNT =================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((t, i) => t + i.qty, 0);
    document.querySelectorAll(".cart-icon span, #cartCount, #navCartCount").forEach(el => el.textContent = count);
}

// ================= ADD TO CART =================
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const pid = String(product._id || product.id);
    const existing = cart.find(item => String(item.id) === pid);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: pid, name: product.name, price: product.price, image: product.image, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showToast(product.name + " added to cart 🛒");
}

document.addEventListener("DOMContentLoaded", updateCartCount);
