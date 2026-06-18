# 🍷 Liquor Store — E-Commerce Website

A full-stack e-commerce platform for a premium liquor delivery service in Nairobi, Kenya.

![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Node.js%20%7C%20MongoDB-gold)
![Status](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen)

---

## Features

- 🛒 Product catalog with category filters, search & pagination
- 🛍️ Shopping cart (localStorage-based)
- 💳 Checkout with M-Pesa STK Push payment
- 📦 Order tracking with real-time status updates
- 🔐 User authentication — register, login, profile, forgot password
- 👑 Admin panel — product CRUD, order management, user list, dashboard stats
- 📸 Admin image upload for product cards

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Payments | M-Pesa Daraja API (STK Push) |
| Auth | JWT |
| Image Uploads | Multer |

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/liquor-store.git
cd liquor-store
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
npm install
npm start
```
Backend runs on `http://localhost:5001`

### 3. Frontend
Open `index.html` in a browser or use Live Server (VS Code extension).

### 4. M-Pesa callback (development)
```bash
ngrok http 5001
# Set MPESA_CALLBACK_URL=https://YOUR_ID.ngrok-free.app/api/mpesa/callback in .env
```

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=your_admin_password
```

---

## Deployment

### Change API URL (one line)
Before deploying, update `js/config.js`:
```js
const API_BASE = "https://your-backend.onrender.com";
```

### Backend → [Render.com](https://render.com)
1. Push repo to GitHub
2. Create a Web Service on Render pointing to the `backend/` folder
3. Add all `.env` variables in the Render dashboard

### Frontend → [Netlify](https://netlify.com)
Drag and drop the root folder (excluding `backend/`) into Netlify.

---

## Project Structure

```
├── index.html
├── shop/
├── cart.html
├── checkout.html
├── orders.html
├── productdetails.html
├── profile.html
├── offers.html
├── admin/                  ← Admin panel
├── js/
│   └── config.js           ← API base URL (change this when deploying)
├── style/
├── assets/images/
└── backend/
    ├── server.js
    ├── routes/
    ├── controllers/
    ├── models/
    └── middleware/
```

---

## Default Admin

Set in `.env` (defaults if not set):
- **Email:** `admin@gmail.com`
- **Password:** `12345`

> ⚠️ Change before deploying to production.

---

## Screenshots

> Add screenshots here

---

## License

MIT — feel free to use and modify.

---

*Built by [Yakuza Labs]🚀*
