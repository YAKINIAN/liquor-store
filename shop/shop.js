const container = document.getElementById("shop");
const searchInput = document.getElementById("search");

// Cart helpers (also in cart.js, defined here for shop page independence)
function getCart() { return JSON.parse(localStorage.getItem("cart")) || []; }
function saveCart(c) { localStorage.setItem("cart", JSON.stringify(c)); }
function updateCartCount() {
    if (typeof window.updateNavCartCount === "function") {
        window.updateNavCartCount();
    } else {
        const count = getCart().reduce((t, i) => t + i.qty, 0);
        document.querySelectorAll("#cartCount, #navCartCount, .cart-icon span").forEach(el => el.textContent = count);
    }
}

let currentCategory = "all";
let products = [];
let currentPage = 1;
const PAGE_SIZE = 12;

async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE}/api/products`);
        const data = await res.json();
        products = data;
        currentPage = 1;
        renderPage();
    } catch (error) {
        console.error("FETCH PRODUCTS ERROR:", error);
        container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">Could not load products. Make sure the backend is running.</p>';
    }
}

function renderPage() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = products.slice(start, start + PAGE_SIZE);
    displayProducts(pageItems);
    renderPagination();
}

function displayProducts(list) {
    if (!list.length) {
        container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">No products found.</p>';
        return;
    }

    container.innerHTML = list.map(product => {
        const img = product.image
            ? (product.image.startsWith('http') ? product.image : '../' + product.image)
            : '';
        return `
            <div class="card">
                ${img ? `<img src="${img}" onerror="this.style.display='none'" loading="lazy" />` : '<div style="height:180px;background:#222;display:flex;align-items:center;justify-content:center;color:#555;font-size:40px;">🍾</div>'}
                <div class="card-body">
                    <h3>${product.name}</h3>
                    <p class="price">KES ${product.price.toLocaleString()}</p>
                    <div class="card-actions">
                        <button onclick="addToCartFromShop('${product._id}')" class="btn-cart">🛒 Add to Cart</button>
                        <button onclick="buyNowFromShop('${product._id}')" class="btn-buy">⚡ Buy Now</button>
                        <button onclick="viewProduct('${product._id}')" class="btn-view">View Details</button>
                    </div>
                </div>
            </div>`;
    }).join("");
}

function renderPagination() {
    let pager = document.getElementById("shopPager");
    if (!pager) {
        pager = document.createElement("div");
        pager.id = "shopPager";
        pager.style.cssText = "display:flex;justify-content:center;gap:8px;padding:30px 0;flex-wrap:wrap;";
        container.parentElement.appendChild(pager);
    }

    const totalPages = Math.ceil(products.length / PAGE_SIZE);
    if (totalPages <= 1) { pager.innerHTML = ""; return; }

    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" style="padding:8px 14px;border-radius:6px;border:1px solid gold;background:${i === currentPage ? 'gold' : 'transparent'};color:${i === currentPage ? '#000' : 'gold'};cursor:pointer;">${i}</button>`;
    }
    pager.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================= VIEW PRODUCT =================
function viewProduct(id) {
    window.location.href = `../productdetails.html?id=${id}`;
}

function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick') === `filterCategory('${category}')`);
    });
    applyFilters();
}

// ================= SEARCH + CATEGORY TOGETHER =================
async function applyFilters() {
    const searchValue = searchInput ? searchInput.value : "";
    let url = `${API_BASE}/api/products?`;

    if (searchValue) url += `search=${encodeURIComponent(searchValue)}&`;
    if (currentCategory !== "all") url += `category=${encodeURIComponent(currentCategory)}&`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        products = data;
        currentPage = 1;
        renderPage();
    } catch (error) {
        console.error("FILTER ERROR:", error);
    }
}

// ================= Add to Cart Function =================
function addToCartFromShop(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => String(item.id) === String(id));

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }

    saveCart(cart);
    updateCartCount();
    openCartDropdown();
}

function buyNowFromShop(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => String(item.id) === String(id));
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();

    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("redirectAfterLogin", "../checkout.html");
        window.location.href = "../login.html";
        return;
    }
    window.location.href = "../checkout.html";
}

// ================= SEARCH EVENT =================
if (searchInput) searchInput.addEventListener("input", applyFilters);

// ================= INITIAL LOAD =================
// Check URL params for pre-selected category or search
(function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('search');

    // Build sidebar from localStorage categories
    const DEFAULT = [
        { name: "Whisky", slug: "whisky" }, { name: "Wine", slug: "wine" },
        { name: "Vodka", slug: "vodka" }, { name: "Gin", slug: "gin" },
        { name: "Beer", slug: "beer" }
    ];
    const cats = JSON.parse(localStorage.getItem("admin_categories") || JSON.stringify(DEFAULT));
    const sidebar = document.getElementById("categoryButtons");
    if (sidebar) {
        sidebar.innerHTML = `<button onclick="filterCategory('all')" class="active">All</button>` +
            cats.map(c => `<button onclick="filterCategory('${c.slug}')">${c.name}</button>`).join("");
    }

    if (cat) {
        currentCategory = cat;
        document.querySelectorAll('.sidebar button').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === cat.toLowerCase());
        });
    }
    if (search && searchInput) searchInput.value = search;
})();

// If URL has search or category params, use applyFilters; otherwise fetch all
(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('search') || params.get('category')) {
        applyFilters();
    } else {
        fetchProducts();
    }
})();

// ================= Cart Dropdown logic =================
function toggleCartDropdown() {
    const dropdown = document.getElementById("cartDropdown");
    dropdown.classList.toggle("show");

    if (dropdown.classList.contains("show")) {
        renderCartPreview();
        localStorage.setItem("cartOpen", "true");
    } else {
        localStorage.setItem("cartOpen", "false");
    }
}

function renderCartPreview() {
    const container = document.getElementById("cartPreviewItems");
    const cart = getCart();

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        const imgSrc = item.image
            ? (item.image.startsWith('http') ? item.image : '../' + item.image)
            : '';

        html += `
            <div class="cart-item-preview">
                ${imgSrc ? `<img src="${imgSrc}" class="preview-img" />` : '<div class="preview-img" style="background:#222;display:flex;align-items:center;justify-content:center;font-size:20px;">🍾</div>'}
                <div class="preview-info">
                    <span>${item.name}</span>
                    <div class="qty-controls">
                        <button onclick="changeQtyPreview('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQtyPreview('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="preview-right">
                    <span>Ksh ${(item.price * item.qty).toLocaleString()}</span>
                    <button onclick="removeFromPreview('${item.id}')">✖</button>
                </div>
            </div>
        `;
    });

    html += `<hr><strong>Total: Ksh ${total}</strong>`;

    container.innerHTML = html;
}

function changeQtyPreview(id, amount) {
    let cart = getCart();
    const item = cart.find(p => String(p.id) === String(id));
    if (!item) return;
    item.qty += amount;
    if (item.qty <= 0) cart = cart.filter(p => String(p.id) !== String(id));
    saveCart(cart);
    renderCartPreview();
    updateCartCount();
    document.getElementById("cartDropdown").classList.add("show");
}

function removeFromPreview(id) {
    let cart = getCart().filter(item => String(item.id) !== String(id));
    saveCart(cart);
    renderCartPreview();
    updateCartCount();
    document.getElementById("cartDropdown").classList.add("show");
}

document.addEventListener("click", function (e) {
    const cart = document.querySelector(".cart");
    const dropdown = document.getElementById("cartDropdown");

    if (!cart || !dropdown) return;

    // ✅ Only close if clicking completely outside
    if (!cart.contains(e.target)) {
        dropdown.classList.remove("show");
        localStorage.setItem("cartOpen", "false");
    }
});

function openCartDropdown() {
    const dropdown = document.getElementById("cartDropdown");

    dropdown.classList.add("show");
    renderCartPreview();
}

document.addEventListener("DOMContentLoaded", () => {
    const isOpen = localStorage.getItem("cartOpen");

    if (isOpen === "true") {
        const dropdown = document.getElementById("cartDropdown");
        dropdown.classList.add("show");
        renderCartPreview();
    }
});