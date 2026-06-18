async function loadFeaturedProducts() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/products/featured`);
        const products = await res.json();

        if (!Array.isArray(products) || !products.length) {
            grid.innerHTML = '<div class="col-12 text-center py-5" style="color:#aaa;">No featured products yet. Add products in the admin panel and mark them as featured.</div>';
            return;
        }

        grid.innerHTML = '';
        products.forEach(p => {
            const img = p.image || '';
            grid.innerHTML += `
                <div class="col-lg-3 col-md-6">
                    <div class="theme-card product-card" style="background:#1b1b1b;">
                        <a href="productdetails.html?id=${p._id}" class="text-decoration-none" style="display: block; color: inherit;">
                            <div class="product-image" style="overflow:hidden;">
                                ${img
                                    ? `<img src="${img}" class="img-fluid" alt="${p.name}" style="height:260px;object-fit:cover;width:100%;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" onerror="this.parentElement.innerHTML='<div style=height:260px;background:#222;display:flex;align-items:center;justify-content:center;font-size:50px;>🍾</div>'">`
                                    : '<div style="height:260px;background:#222;display:flex;align-items:center;justify-content:center;font-size:50px;">🍾</div>'
                                }
                            </div>
                            <div class="product-content" style="padding:18px 18px 0 18px;">
                                <h5 style="color:#fff;font-size:15px;margin-bottom:4px;text-align:center;">${p.name}</h5>
                                <p class="price" style="color:var(--gold);font-size:18px;font-weight:700;margin-bottom:14px;text-align:center;">Ksh ${p.price.toLocaleString()}</p>
                            </div>
                        </a>
                        <div class="product-content" style="padding:0 18px 18px 18px;">
                            <div class="d-flex gap-2">
                                <button class="btn flex-fill" style="background:var(--gold);color:#111;font-weight:700;border-radius:8px;" onclick='addToCart(${JSON.stringify({ _id: p._id, name: p.name, price: p.price, image: p.image })})'>Add to Cart</button>
                                <a href="productdetails.html?id=${p._id}" class="btn btn-outline-secondary" style="border-color:#444;color:#ccc;border-radius:8px;"><i class="fa fa-eye"></i></a>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) {
        const grid = document.getElementById('featuredGrid');
        if (grid) grid.innerHTML = '<div class="col-12 text-center py-5" style="color:#aaa;">Could not load products. Make sure the backend is running.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
