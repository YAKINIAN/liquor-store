const params  = new URLSearchParams(window.location.search);
const orderId  = params.get("orderId");

async function loadOrder() {
    if (!orderId) return;
    const token = localStorage.getItem("token");

    for (let attempt = 0; attempt < 8; attempt++) {
        try {
            const res  = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: "Bearer " + token } });
            const data = await res.json();
            const order = (data.orders || []).find(o => o._id === orderId);
            if (!order) return;
            if (order.payment?.receipt) { displayReceipt(order); return; }
            if (attempt === 0) displayReceipt(order);
        } catch (e) { console.error("❌", e); return; }
        await new Promise(r => setTimeout(r, 1500));
    }
}

/* ─── Build receipt HTML ─────────────────────────────────────────────── */
function buildReceiptData(order) {
    const payment   = order.payment || {};
    let subtotal    = 0;
    let itemsHTML   = "";
    let itemRowsPDF = "";

    (order.items || []).forEach(item => {
        const line = item.price * item.qty;
        subtotal += line;
        itemsHTML += `
          <tr>
            <td class="rc-item-name">${item.name}</td>
            <td class="rc-item-qty">x${item.qty}</td>
            <td class="rc-item-price">KES ${line.toLocaleString()}</td>
          </tr>`;
        itemRowsPDF += `<tr>
          <td style="padding:4px 0;font-size:13px;color:#111111;font-family:'Courier New',monospace;">${item.name}</td>
          <td style="padding:4px 0;font-size:13px;text-align:center;color:#777777;font-family:'Courier New',monospace;">x${item.qty}</td>
          <td style="padding:4px 0;font-size:13px;text-align:right;font-weight:700;color:#111111;font-family:'Courier New',monospace;white-space:nowrap;">KES ${line.toLocaleString()}</td>
        </tr>`;
    });

    const delivery     = order.delivery === "Pick from Store" ? 0 : 200;
    const total        = subtotal + delivery;
    const d            = new Date(order.createdAt);
    const dateStr      = d.toLocaleDateString("en-KE", { year:"numeric", month:"long", day:"numeric" });
    const timeStr      = d.toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" });
    const shortId      = (order._id || "").slice(-8).toUpperCase();
    const fulfillLabel = order.delivery === "Pick from Store" ? "PICK-UP" : "DELIVERY";
    const deliveryText = order.delivery || "—";
    const statusColor  = "#16a34a";

    return { payment, subtotal, itemsHTML, itemRowsPDF, delivery, total,
             dateStr, timeStr, shortId, fulfillLabel, deliveryText, statusColor };
}

/* ─── On-page receipt ────────────────────────────────────────────────── */
function displayReceipt(order) {
    window._receiptOrder = order;
    const box = document.getElementById("receipt");
    if (!box) return;

    const { payment, subtotal, itemsHTML, delivery, total,
            dateStr, timeStr, shortId, fulfillLabel, deliveryText, statusColor } = buildReceiptData(order);

    const dash = `<tr><td colspan="2"><div class="rc-dash"></div></td></tr>`;

    box.innerHTML = `
    <div class="rc-wrap">

      <!-- Header -->
      <div class="rc-header">
        <div class="rc-logo-emoji">🍷</div>
        <div class="rc-brand">LIQUOR STORE</div>
        <div class="rc-tagline">PREMIUM SPIRITS · NAIROBI</div>
      </div>

      <div class="rc-dash"></div>

      <!-- Store info -->
      <div class="rc-storeinfo">
        <span>📍 Nairobi, Kenya</span>
        <span>📞 +254 700 000 000</span>
        <span>🌐 liquorstore.co.ke</span>
      </div>

      <div class="rc-dash"></div>

      <!-- Meta -->
      <table class="rc-meta-table">
        <tr><td class="rc-meta-label">DATE</td><td class="rc-meta-val">${dateStr}</td></tr>
        <tr><td class="rc-meta-label">TIME</td><td class="rc-meta-val">${timeStr}</td></tr>
        <tr><td class="rc-meta-label">ORDER #</td><td class="rc-meta-val">${shortId}</td></tr>
        <tr><td class="rc-meta-label">${fulfillLabel}</td><td class="rc-meta-val">${deliveryText}</td></tr>
      </table>

      <div class="rc-dash"></div>

      <!-- Items -->
      <table class="rc-items-table">
        <thead>
          <tr>
            <th class="rc-th-left">ITEM</th>
            <th class="rc-th-center">QTY</th>
            <th class="rc-th-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <div class="rc-dash"></div>

      <!-- Totals -->
      <table class="rc-totals-table">
        <tr><td>SUBTOTAL</td><td class="rc-tot-right">KES ${subtotal.toLocaleString()}</td></tr>
        <tr><td>DELIVERY FEE</td><td class="rc-tot-right">KES ${delivery.toLocaleString()}</td></tr>
      </table>
      <div class="rc-total-divider"></div>
      <table class="rc-totals-table">
        <tr>
          <td class="rc-grand-label">TOTAL PAID</td>
          <td class="rc-grand-val">KES ${total.toLocaleString()}</td>
        </tr>
      </table>

      <div class="rc-dash"></div>

      <!-- Payment -->
      <div class="rc-pay-head">PAYMENT METHOD</div>
      <div class="rc-pay-grid">
        <span class="rc-pay-key">METHOD</span><span class="rc-pay-val">M-PESA</span>
        <span class="rc-pay-key">PHONE</span><span class="rc-pay-val">${payment.phone || "—"}</span>
        <span class="rc-pay-key">RECEIPT</span><span class="rc-pay-val rc-pay-receipt">${payment.receipt || "The service request is processed successfully."}</span>
        <span class="rc-pay-key">STATUS</span><span class="rc-pay-val" style="color:${statusColor};font-weight:800;">✓ PAID</span>
      </div>

      <div class="rc-dash"></div>

      <!-- QR Code -->
      <div class="rc-qr-section">
        <div id="rc-qr-canvas"></div>
        <div class="rc-qr-label">${shortId}</div>
      </div>

      <div class="rc-dash"></div>

      <!-- Footer -->
      <div class="rc-footer">
        <div class="rc-footer-thanks">THANK YOU FOR YOUR ORDER!</div>
        <div>Drink responsibly. Must be 18+</div>
        <div>support@liquorstore.co.ke</div>
        <div class="rc-footer-official">*** OFFICIAL RECEIPT ***</div>
      </div>

    </div>`;

    // Generate QR code into the canvas div
    try {
        new QRCode(document.getElementById("rc-qr-canvas"), {
            text: `https://liquorstore.co.ke/orders?id=${order._id}`,
            width: 110, height: 110,
            colorDark: "#111", colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.M
        });
    } catch(e) { console.warn("QR skipped", e); }
}

/* ─── Sparkles ───────────────────────────────────────────────────────── */
function triggerSparkles() {
    const container = document.getElementById("sparkles");
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 35; i++) {
        const s      = document.createElement("div");
        s.className  = "sparkle";
        const angle  = Math.random() * Math.PI * 2;
        const dist   = Math.random() * 90 + 35;
        s.style.setProperty("--x", `${Math.cos(angle)*dist}px`);
        s.style.setProperty("--y", `${Math.sin(angle)*dist}px`);
        const size   = Math.random() * 5 + 3;
        s.style.cssText += `width:${size}px;height:${size}px;left:calc(50% + ${Math.random()*20-10}px);top:40px;animation-delay:${Math.random()*0.25+0.75}s`;
        container.appendChild(s);
    }
}

document.addEventListener("DOMContentLoaded", () => { loadOrder(); triggerSparkles(); });

/* ─── PDF Download ───────────────────────────────────────────────────── */
document.getElementById("downloadBtn").addEventListener("click", async () => {
    const order = window._receiptOrder || {};
    if (!order._id) { alert("Receipt not loaded yet. Please wait."); return; }

    const { payment, subtotal, itemRowsPDF, delivery, total,
            dateStr, timeStr, shortId, fulfillLabel, deliveryText } = buildReceiptData(order);

    // Generate QR as data URL
    let qrImg = "";
    try {
        const tmp = Object.assign(document.createElement("div"), { style: "position:fixed;left:-9999px;top:0" });
        document.body.appendChild(tmp);
        new QRCode(tmp, { text: `https://liquorstore.co.ke/orders?id=${order._id}`, width:130, height:130, colorDark:"#111", colorLight:"#fff", correctLevel: QRCode.CorrectLevel.M });
        await new Promise(r => setTimeout(r, 300));
        const el = tmp.querySelector("canvas") || tmp.querySelector("img");
        qrImg = el ? (el.toDataURL ? el.toDataURL() : el.src) : "";
        document.body.removeChild(tmp);
    } catch(e) {}

    const D = `<tr><td colspan="3"><div style="border-top:1px dashed #ccc;margin:10px 0;"></div></td></tr>`;

    const overlay = document.createElement("div");
    overlay.id = "receipt-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;";
    overlay.innerHTML = `
      <div style="background:#fff;width:100%;max-width:420px;border-radius:8px;padding:32px 24px 36px;font-family:'Courier New',monospace;color:#111;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td colspan="3" style="text-align:center;padding-bottom:8px;">
            <div style="font-size:28px;">🍷</div>
            <div style="font-size:20px;font-weight:900;letter-spacing:4px;color:#b8860b;font-family:Georgia,serif;margin-top:4px;">LIQUOR STORE</div>
            <div style="font-size:9px;letter-spacing:3px;color:#999;margin-top:2px;">PREMIUM SPIRITS · NAIROBI</div>
          </td></tr>
          ${D}
          <tr><td colspan="3" style="text-align:center;font-size:11px;color:#777;line-height:2;padding-bottom:4px;">
            Nairobi, Kenya &nbsp;|&nbsp; +254 700 000 000 &nbsp;|&nbsp; liquorstore.co.ke
          </td></tr>
          ${D}
          <tr><td style="color:#999;font-size:12px;padding:2px 0;">DATE</td><td></td><td style="text-align:right;font-weight:700;font-size:12px;">${dateStr}</td></tr>
          <tr><td style="color:#999;font-size:12px;padding:2px 0;">TIME</td><td></td><td style="text-align:right;font-weight:700;font-size:12px;">${timeStr}</td></tr>
          <tr><td style="color:#999;font-size:12px;padding:2px 0;">ORDER #</td><td></td><td style="text-align:right;font-weight:700;font-size:12px;color:#b8860b;">${shortId}</td></tr>
          <tr><td style="color:#999;font-size:12px;padding:2px 0;">${fulfillLabel}</td><td></td><td style="text-align:right;font-weight:700;font-size:12px;">${deliveryText}</td></tr>
          ${D}
          <tr>
            <th style="text-align:left;font-size:10px;color:#999;font-weight:700;padding-bottom:5px;letter-spacing:1px;">ITEM</th>
            <th style="text-align:center;font-size:10px;color:#999;font-weight:700;padding-bottom:5px;letter-spacing:1px;">QTY</th>
            <th style="text-align:right;font-size:10px;color:#999;font-weight:700;padding-bottom:5px;letter-spacing:1px;">AMOUNT</th>
          </tr>
          <tr><td colspan="3"><div style="border-top:1px solid #ddd;margin-bottom:4px;"></div></td></tr>
          ${itemRowsPDF}
          ${D}
          <tr><td style="font-size:12px;color:#777;padding:2px 0;">SUBTOTAL</td><td></td><td style="text-align:right;font-size:12px;color:#777;">KES ${subtotal.toLocaleString()}</td></tr>
          <tr><td style="font-size:12px;color:#777;padding:2px 0;">DELIVERY</td><td></td><td style="text-align:right;font-size:12px;color:#777;">KES ${delivery.toLocaleString()}</td></tr>
          <tr><td colspan="3"><div style="border-top:2px solid #111;margin:8px 0;"></div></td></tr>
          <tr>
            <td style="font-size:15px;font-weight:900;">TOTAL PAID</td><td></td>
            <td style="text-align:right;font-size:15px;font-weight:900;color:#b8860b;">KES ${total.toLocaleString()}</td>
          </tr>
          ${D}
          <tr><td colspan="3" style="font-size:10px;font-weight:800;color:#555;letter-spacing:2px;padding-bottom:6px;">PAYMENT METHOD</td></tr>
          <tr><td style="font-size:11px;color:#999;">METHOD</td><td></td><td style="text-align:right;font-size:11px;font-weight:700;">M-PESA</td></tr>
          <tr><td style="font-size:11px;color:#999;">PHONE</td><td></td><td style="text-align:right;font-size:11px;">${payment.phone || "—"}</td></tr>
          <tr><td style="font-size:11px;color:#999;">RECEIPT</td><td></td><td style="text-align:right;font-size:11px;color:#b8860b;font-weight:700;">${payment.receipt || "Processed successfully."}</td></tr>
          <tr><td style="font-size:11px;color:#999;">STATUS</td><td></td><td style="text-align:right;font-size:11px;color:#16a34a;font-weight:800;">✓ PAID</td></tr>
          ${D}
          <tr><td colspan="3" style="text-align:center;padding:8px 0;">
            ${qrImg ? `<img src="${qrImg}" style="width:120px;height:120px;display:block;margin:0 auto;border:1px solid #eee;border-radius:4px;">` : ""}
            <div style="font-size:10px;color:#999;letter-spacing:3px;margin-top:6px;">${shortId}</div>
          </td></tr>
          ${D}
          <tr><td colspan="3" style="text-align:center;font-size:11px;color:#777;line-height:2;padding-top:4px;">
            <div style="font-weight:800;color:#b8860b;font-size:13px;letter-spacing:1px;">THANK YOU FOR YOUR ORDER!</div>
            <div>Drink responsibly. Must be 18+</div>
            <div>support@liquorstore.co.ke</div>
            <div style="margin-top:6px;font-size:10px;color:#bbb;letter-spacing:1px;">*** OFFICIAL RECEIPT ***</div>
          </td></tr>
        </table>
      </div>
      <div style="display:flex;gap:12px;margin-top:16px;width:100%;max-width:420px;">
        <button onclick="window.print()" style="flex:1;padding:12px;background:#b8860b;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;">🖨️ Print / Save PDF</button>
        <button onclick="document.getElementById('receipt-overlay').remove()" style="flex:1;padding:12px;background:#333;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">✕ Close</button>
      </div>`;

    document.body.appendChild(overlay);
});
