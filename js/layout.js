/**
 * layout.js — injects unified navbar and footer into every page.
 * Each page must have: <div id="site-nav"></div> and <footer id="site-footer"></footer>
 * Set window.PAGE_ROOT = '../' on pages inside subdirectories (shop/, admin/)
 */

(function () {
    const root = window.PAGE_ROOT || '';
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((t, i) => t + i.qty, 0);

    // ===== INJECT BACKGROUND WRAPPER (static, no particles) =====
    function injectLuxuryBackground() {
        if (!document.querySelector('.luxury-bg-wrapper')) {
            const bgWrapper = document.createElement('div');
            bgWrapper.className = 'luxury-bg-wrapper';
            document.body.appendChild(bgWrapper);
        }
    }
    if (document.body) {
        injectLuxuryBackground();
    } else {
        document.addEventListener('DOMContentLoaded', injectLuxuryBackground);
    }
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // ===== INJECT STYLES FOR CART DROPDOWN AND QUANTITY CONTROLS =====
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* Jumia Style Cart Dropdown styling */
        .cart-dropdown-wrap {
            position: relative;
            display: inline-block;
        }
        .nav-cart-dropdown {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            width: 320px;
            background: #1b1b1b;
            border: 1px solid #d4af37;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            z-index: 1000;
            color: #fff;
            margin-top: 10px;
        }
        .cart-dropdown-wrap:hover .nav-cart-dropdown {
            display: block !important;
        }
        .nav-qty-btn {
            background: #d4af37;
            border: none;
            width: 20px;
            height: 20px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 3px;
            color: #111;
            line-height: 1;
            transition: background 0.2s;
        }
        .nav-qty-btn:hover {
            background-color: #f1c84c !important;
        }
        .nav-remove-btn {
            background: none;
            border: none;
            color: #dc3545;
            font-size: 16px;
            cursor: pointer;
            padding: 0 4px;
            transition: color 0.2s;
        }
        .nav-remove-btn:hover {
            color: #ff4d4d !important;
        }
    `;
    document.head.appendChild(styleEl);

    // Render Jumia Cart Dropdown Items
    function renderNavCartDropdown() {
        const dropdown = document.getElementById('navCartDropdown');
        if (!dropdown) return;

        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartItems.length === 0) {
            dropdown.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🛒</div>
                    <p style="margin: 0; color: #aaa; font-size: 14px;">Your cart is empty</p>
                </div>
            `;
            return;
        }

        let html = '<div style="max-height: 250px; overflow-y: auto; margin-bottom: 12px; padding-right: 4px;">';
        let total = 0;

        cartItems.forEach(item => {
            total += item.price * item.qty;
            const imgSrc = item.image
                ? (item.image.startsWith('http') ? item.image : root + item.image)
                : root + 'assets/images/placeholder.png';

            html += `
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #333;">
                    <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='${root}assets/images/placeholder.png'">
                    <div style="flex: 1; min-width: 0; text-align: left;">
                        <div style="font-weight: 600; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: #fff; margin-bottom: 2px;">${item.name}</div>
                        <div style="color: #d4af37; font-size: 12px; font-weight: 600; margin-bottom: 4px;">KES ${item.price.toLocaleString()}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="nav-qty-btn" data-id="${item.id}" data-delta="-1">-</button>
                            <span style="font-size:12px; color: #fff; font-weight: 600;">${item.qty}</span>
                            <button class="nav-qty-btn" data-id="${item.id}" data-delta="1">+</button>
                        </div>
                    </div>
                    <button class="nav-remove-btn" data-id="${item.id}">✖</button>
                </div>
            `;
        });

        html += `</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-weight:bold; font-size: 14px;">
                <span>Total:</span>
                <span style="color:#d4af37;">KES ${total.toLocaleString()}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <a href="${root}cart.html" style="flex: 1; background: transparent; border: 1px solid #d4af37; color: #d4af37; text-align: center; font-size: 12px; font-weight: 600; padding: 8px 4px; border-radius: 4px; text-decoration: none; text-transform: uppercase;">View Cart</a>
                <a href="${root}checkout.html" style="flex: 1; background: #d4af37; border: none; color: #111; text-align: center; font-size: 12px; font-weight: 600; padding: 8px 4px; border-radius: 4px; text-decoration: none; text-transform: uppercase;">Checkout</a>
            </div>
        `;

        dropdown.innerHTML = html;
    }

    // ===== NAVBAR =====
    const navEl = document.getElementById('site-nav');
    if (navEl) {
        const isAdmin = user?.role === 'admin';
        const userMenuHTML = token ? `
            ${isAdmin ? `<a href="${root}admin/index.html" style="color:#d4af37;font-weight:700;">👑 Admin</a>` : ''}
            <a href="${root}profile.html">My Account</a>
            <a href="${root}orders.html">My Orders</a>
            <a href="#" id="navLogout">Logout</a>
        ` : `
            <a href="${root}login.html">Login</a>
            <a href="${root}signup.html">Sign Up</a>
        `;

        navEl.innerHTML = `
        <nav class="site-nav">
            <div class="container">
                <a href="${root}index.html" class="brand">🍷 LIQUOR STORE</a>

                <button class="hamburger" id="navToggle" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>

                <ul class="nav-links" id="navLinks">
                    <li><a href="${root}index.html" ${!root ? 'class="active"' : ''}>Home</a></li>
                    <li><a href="${root}shop/shop.html">Shop</a></li>
                    <li><a href="${root}offers.html">Offers</a></li>
                    <li><a href="${root}orders.html">My Orders</a></li>
                    <li><a href="#site-footer">Contact</a></li>
                </ul>

                <div class="nav-right">
                    <div class="search-wrap">
                        <i class="fa fa-search"></i>
                        <input type="text" id="navSearch" placeholder="Search products...">
                    </div>

                    <div class="account-wrap">
                        <span class="account-btn"><i class="fa-regular fa-user"></i></span>
                        <div class="account-dropdown">${userMenuHTML}</div>
                    </div>

                    <div class="cart-dropdown-wrap">
                        <a href="${root}cart.html" class="cart-btn">
                            <i class="fa-solid fa-cart-shopping"></i>
                            <span class="badge" id="navCartCount">${cartCount}</span>
                        </a>
                        <div class="nav-cart-dropdown" id="navCartDropdown"></div>
                    </div>
                </div>
            </div>
        </nav>`;

        // Hamburger toggle
        document.getElementById('navToggle')?.addEventListener('click', () => {
            document.getElementById('navLinks')?.classList.toggle('open');
        });

        // Logout
        document.getElementById('navLogout')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('adminToken');
            window.location.href = root + 'index.html';
        });

        // Search on Enter or icon click
        function doNavSearch() {
            const input = document.getElementById('navSearch');
            const val = input?.value.trim();
            // On mobile the input is hidden — go straight to shop
            if (!val) { window.location.href = `${root}shop/shop.html`; return; }
            window.location.href = `${root}shop/shop.html?search=${encodeURIComponent(val)}`;
        }
        document.getElementById('navSearch')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doNavSearch();
        });
        document.getElementById('navSearchBtn')?.addEventListener('click', doNavSearch);
        document.querySelector('.search-wrap i')?.addEventListener('click', doNavSearch);

        // Event listener for cart dropdown inputs
        const dropdownEl = document.getElementById('navCartDropdown');
        if (dropdownEl) {
            dropdownEl.addEventListener('click', (e) => {
                const qtyBtn = e.target.closest('.nav-qty-btn');
                const removeBtn = e.target.closest('.nav-remove-btn');

                if (qtyBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = qtyBtn.dataset.id;
                    const delta = parseInt(qtyBtn.dataset.delta);
                    
                    let localCart = JSON.parse(localStorage.getItem('cart')) || [];
                    const item = localCart.find(p => String(p.id) === String(id));
                    if (item) {
                        item.qty += delta;
                        if (item.qty <= 0) {
                            localCart = localCart.filter(p => String(p.id) !== String(id));
                        }
                        localStorage.setItem('cart', JSON.stringify(localCart));
                        window.updateNavCartCount();
                        if (typeof window.renderCart === 'function') {
                            window.renderCart();
                        }
                    }
                }

                if (removeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = removeBtn.dataset.id;
                    let localCart = JSON.parse(localStorage.getItem('cart')) || [];
                    localCart = localCart.filter(p => String(p.id) !== String(id));
                    localStorage.setItem('cart', JSON.stringify(localCart));
                    window.updateNavCartCount();
                    if (typeof window.renderCart === 'function') {
                        window.renderCart();
                    }
                }
            });
        }

        renderNavCartDropdown();
    }

    // ===== FOOTER =====
    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
        footerEl.innerHTML = `
        <div class="site-footer">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-3 col-md-6">
                        <div class="footer-brand">🍷 Liquor Store</div>
                        <p>Premium wines, whisky, vodka and spirits delivered fast and safely to your doorstep in Nairobi.</p>
                        <div class="socials">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-tiktok"></i></a>
                            <a href="#"><i class="fab fa-whatsapp"></i></a>
                        </div>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><a href="${root}index.html">🏠 Home</a></li>
                            <li><a href="${root}shop/shop.html">🛒 Shop</a></li>
                            <li><a href="${root}offers.html">🔥 Offers</a></li>
                            <li><a href="${root}orders.html">📦 My Orders</a></li>
                            <li><a href="${root}cart.html">🛍️ Cart</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <h5>Categories</h5>
                        <ul>
                            <li><a href="${root}shop/shop.html?category=wine">🍷 Wines</a></li>
                            <li><a href="${root}shop/shop.html?category=whisky">🥃 Whisky</a></li>
                            <li><a href="${root}shop/shop.html?category=vodka">🍸 Vodka</a></li>
                            <li><a href="${root}shop/shop.html?category=gin">🍹 Gin</a></li>
                            <li><a href="${root}shop/shop.html?category=beer">🍺 Beer</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <h5>Contact Us</h5>
                        <ul>
                            <li><a href="tel:+254700000000">📞 +254 700 000 000</a></li>
                            <li><a href="mailto:info@liquorstore.com">📧 info@liquorstore.com</a></li>
                            <li><span style="color:#aaa;">📍 Nairobi, Kenya</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p style="margin:0;">© ${new Date().getFullYear()} Liquor Store. All Rights Reserved. Created by Ian Yakini 🚀 &nbsp;|&nbsp; <a href="${root}admin/login.html" style="color:rgba(212,175,55,0.6);text-decoration:none;"><i class="fa fa-lock"></i> CMS Login</a></p>
            </div>
        </div>`;
    }

    // ===== UPDATE CART COUNT (called externally too) =====
    window.updateNavCartCount = function () {
        const c = JSON.parse(localStorage.getItem('cart')) || [];
        const n = c.reduce((t, i) => t + i.qty, 0);
        document.querySelectorAll('#navCartCount, .cart-icon span, #cartCount').forEach(el => el.textContent = n);
        renderNavCartDropdown();
    };
})();
