const API_URL = `${API_BASE}/api/products`;
const UPLOAD_URL = `${API_BASE}/api/upload`;

let productModal;

document.addEventListener("DOMContentLoaded", () => {
    productModal = new bootstrap.Modal(document.getElementById("productModal"));

    // Populate category dropdown from localStorage (managed in categories page)
    const cats = JSON.parse(localStorage.getItem("admin_categories") || "[]");
    const select = document.getElementById("pCategory");
    if (cats.length) {
        select.innerHTML = `<option value="" disabled selected>Select Category</option>` +
            cats.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");
    }

    loadProducts();
    document.getElementById("saveProduct").addEventListener("click", handleSaveProduct);

    document.getElementById("pImageFile").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById("imagePreview").src = e.target.result;
            document.getElementById("imagePreviewWrap").style.display = "block";
        };
        reader.readAsDataURL(file);
    });
});

async function loadProducts() {
    const tableBody = document.getElementById("productsTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();

        const statsCount = document.getElementById("totalProductsCount");
        if (statsCount) statsCount.textContent = products.length;

        if (products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No products found. Click Add Product to create one.</td></tr>`;
            return;
        }

        tableBody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image}" alt="${p.name}" width="50" class="rounded border" onerror="this.src='../assets/images/placeholder.png'"></td>
                <td class="fw-bold">${p.name}</td>
                <td class="text-capitalize">${p.category}</td>
                <td>${p.brand}</td>
                <td class="fw-semibold text-danger">KES ${p.price.toLocaleString()}</td>
                <td>${p.stock}</td>
                <td><span class="badge ${p.featured ? 'bg-success' : 'bg-secondary'}">${p.featured ? 'Yes' : 'No'}</span></td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm" onclick="openEditModal('${p._id}')"><i class="fa fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="handleDeleteProduct('${p._id}')"><i class="fa fa-trash"></i> Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error("Load products error:", err);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error loading products from server.</td></tr>`;
    }
}

function openAddModal() {
    document.getElementById("modalTitle").textContent = "Add Product";
    document.getElementById("productForm").reset();
    document.getElementById("pId").value = "";
    document.getElementById("pImage").value = "";
    document.getElementById("imagePreviewWrap").style.display = "none";
    productModal.show();
}

async function openEditModal(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Could not fetch product");
        const p = await res.json();

        document.getElementById("modalTitle").textContent = "Edit Product";
        document.getElementById("pId").value = p._id;
        document.getElementById("pName").value = p.name;
        document.getElementById("pPrice").value = p.price;
        document.getElementById("pCategory").value = p.category;
        document.getElementById("pBrand").value = p.brand;
        document.getElementById("pImage").value = p.image;
        document.getElementById("pStock").value = p.stock || 0;
        document.getElementById("pDescription").value = p.description || "";
        document.getElementById("pFeatured").checked = !!p.featured;

        // Show existing image preview
        document.getElementById("imagePreview").src = p.image;
        document.getElementById("imagePreviewWrap").style.display = "block";
        document.getElementById("pImageFile").value = ""; // clear file input

        productModal.show();
    } catch (err) {
        alert("Could not load product details.");
    }
}

async function handleSaveProduct(e) {
    e.preventDefault();

    const id = document.getElementById("pId").value;
    const name = document.getElementById("pName").value.trim();
    const price = parseFloat(document.getElementById("pPrice").value);
    const category = document.getElementById("pCategory").value;
    const brand = document.getElementById("pBrand").value.trim();
    const stock = parseInt(document.getElementById("pStock").value) || 0;
    const description = document.getElementById("pDescription").value.trim();
    const featured = document.getElementById("pFeatured").checked;
    const fileInput = document.getElementById("pImageFile");
    const token = localStorage.getItem("token");

    if (!name || isNaN(price) || !category || !brand) {
        alert("Please fill in all required fields (*).");
        return;
    }

    // Upload new image if a file was chosen
    let imageUrl = document.getElementById("pImage").value;
    if (fileInput.files[0]) {
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        const uploadRes = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        if (!uploadRes.ok) { alert("Image upload failed."); return; }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
    }

    if (!imageUrl) { alert("Please select a product image."); return; }

    const payload = { name, price, category, brand, image: imageUrl, stock, description, featured };
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `${API_URL}/${id}` : API_URL;

    try {
        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            productModal.hide();
            loadProducts();
        } else {
            alert("Error: " + (data.message || "Failed to save product"));
        }
    } catch (err) {
        alert("Server error. Could not connect to API.");
    }
}

async function handleDeleteProduct(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) loadProducts();
        else alert("Failed to delete product.");
    } catch (err) {
        alert("Server error.");
    }
}
