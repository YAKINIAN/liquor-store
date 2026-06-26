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

## Screenshots

<img width="1920" height="918" alt="Shop" src="https://github.com/user-attachments/assets/b3f8baed-4156-441c-a54a-4693b3f35480" />
<img width="1920" height="916" alt="Offers" src="https://github.com/user-attachments/assets/55322a67-b132-4e19-adde-753ec5dcfacc" />
<img width="1920" height="918" alt="My Orders" src="https://github.com/user-attachments/assets/2e0f696e-dfef-4e8f-9d05-6a9e731565e1" />
<img width="1920" height="914" alt="Home page 4" src="https://github.com/user-attachments/assets/d1f72c80-bb60-43cc-a503-514bffaade05" />
<img width="1920" height="918" alt="Home page 3" src="https://github.com/user-attachments/assets/027026b1-f618-464f-a037-8f2b3f5b8e96" />
<img width="1920" height="921" alt="Home page 2" src="https://github.com/user-attachments/assets/7004c3cb-aa1e-4cad-9892-36ba28bf9d92" />
<img width="1920" height="913" alt="Home page 1" src="https://github.com/user-attachments/assets/66146d93-e6b4-4ee8-8f5b-4aba71212afe" />
<img width="1920" height="913" alt="Checkout" src="https://github.com/user-attachments/assets/bdebfb60-ab6c-4d44-9180-ca6d241c035b" />
<img width="1920" height="916" alt="Cart" src="https://github.com/user-attachments/assets/74921f78-3cec-487c-927a-7dad5a522291" />
<img width="1920" height="889" alt="Admin-Users" src="https://github.com/user-attachments/assets/93b263fc-b288-4951-9c27-d30bb6730f06" />
<img width="1920" height="909" alt="Admin-Products" src="https://github.com/user-attachments/assets/18f5713b-abca-4534-9bef-994de2edb00a" />
<img width="1920" height="895" alt="Admin-Orders" src="https://github.com/user-attachments/assets/0f3cf5bb-7d29-4735-b879-dfb5a625927f" />
<img width="1920" height="904" alt="Admin-Dashboard" src="https://github.com/user-attachments/assets/b24cae59-217f-4dad-8df6-2546dd14d5d8" />
<img width="1920" height="896" alt="Admin-Categories" src="https://github.com/user-attachments/assets/7262ba2b-dde5-4584-bc9e-832fc933f084" />




## License

MIT — feel free to use and modify.

---

*Built by [Yakuza Labs]🚀*
