function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();

    // Bind event listener only once on load
    const cartItems = document.getElementById("cartItemsContainer");
    if (cartItems) {
        cartItems.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-id]");
            const trash = e.target.closest("[data-remove]");

            if (btn) {
                const id = btn.dataset.id;
                const amount = parseInt(btn.dataset.action);
                changeQty(id, amount);
            }
            if (trash) {
                removeItem(trash.dataset.remove);
            }
        });
    }
});

function renderCart() {
    const cartItems = document.getElementById("cartItemsContainer");
    const cart = getCart();

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center mt-5 py-5">
                <div style="font-size:60px;">🛒</div>
                <h4 class="mt-3" style="color:#d4af37;">Your cart is empty</h4>
                <p style="color:#aaa;">Add some premium drinks to continue shopping</p>
                <a href="shop/shop.html" class="btn mt-3 px-4" style="background:#d4af37;color:#111;font-weight:600;border-radius:8px;">Browse Shop</a>
            </div>`;
        updateSummary(0);
        return;
    }

    let html = "";
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        const imgSrc = item.image
            ? (item.image.startsWith('http') ? item.image : item.image)
            : 'assets/images/placeholder.png';

        // Use data-id attribute to avoid quoting issues with MongoDB string IDs
        html += `
        <div class="cart-item d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-3">
                <img src="${imgSrc}" class="cart-img" width="80" onerror="this.src='assets/images/placeholder.png'">
                <div>
                    <h5 style="color:#fff;">${item.name}</h5>
                    <p style="color:#888;margin:0;">Ksh ${item.price.toLocaleString()}</p>
                </div>
            </div>
            <div class="quantity-box">
                <button data-id="${item.id}" data-action="-1">-</button>
                <input type="text" value="${item.qty}" readonly>
                <button data-id="${item.id}" data-action="1">+</button>
            </div>
            <div><h5 style="color:#fff;">Ksh ${(item.price * item.qty).toLocaleString()}</h5></div>
            <div>
                <i class="fa-solid fa-trash text-danger" style="cursor:pointer;font-size:18px;" data-remove="${item.id}"></i>
            </div>
        </div><hr>`;
    });

    cartItems.innerHTML = html;
    updateSummary(subtotal);
}

// Make renderCart available globally so other layouts can trigger updates
window.renderCart = renderCart;

function updateSummary(subtotal) {
    const delivery = 200;
    const total = subtotal + delivery;

    document.getElementById("cartSummary").innerHTML = `
        <h4 style="color:#d4af37;">Order Summary</h4>
        <hr>
        <p class="d-flex justify-content-between">
            <span>Subtotal</span><span>Ksh ${subtotal.toLocaleString()}</span>
        </p>
        <p class="d-flex justify-content-between">
            <span>Delivery</span><span>Ksh 200</span>
        </p>
        <hr>
        <h5 class="d-flex justify-content-between">
            <span>Total</span><span style="color:#d4af37;">Ksh ${total.toLocaleString()}</span>
        </h5>
        <button onclick="goToCheckout()" class="btn w-100 mt-3" style="background:#d4af37;color:#111;font-weight:700;padding:14px;border-radius:10px;font-size:16px;">
            Proceed to Checkout
        </button>`;
}

function changeQty(id, amount) {
    let cart = getCart();
    const item = cart.find(p => String(p.id) === String(id));
    if (!item) return;
    item.qty += amount;
    if (item.qty <= 0) cart = cart.filter(p => String(p.id) !== String(id));
    saveCart(cart);
    renderCart();
    updateCartCount();
    if (typeof window.updateNavCartCount === "function") {
        window.updateNavCartCount();
    }
}

function removeItem(id) {
    let cart = getCart().filter(p => String(p.id) !== String(id));
    saveCart(cart);
    renderCart();
    updateCartCount();
    if (typeof window.updateNavCartCount === "function") {
        window.updateNavCartCount();
    }
}

function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((t, i) => t + i.qty, 0);

    // Update both possible cart count elements
    document.querySelectorAll(".cart-icon span, #cartCount").forEach(el => {
        el.textContent = total;
    });
}

document.addEventListener("DOMContentLoaded", updateCartCount);

function goToCheckout() {
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("redirectAfterLogin", "checkout.html");
        window.location.href = "login.html";
        return;
    }
    window.location.href = "checkout.html";
}

// Buy Now — add to cart and go straight to checkout
function buyNow(product) {
    let cart = getCart();
    const existing = cart.find(p => String(p.id) === String(product._id || product.id));
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product._id || product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("redirectAfterLogin", "checkout.html");
        window.location.href = "login.html";
        return;
    }
    window.location.href = "checkout.html";
}
