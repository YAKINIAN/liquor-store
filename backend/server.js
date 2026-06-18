// ================= ENVIRONMENT LOAD =================
require("dotenv").config();

// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// Database connection config
const connectDB = require("./config/db");

// Models for seeding
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orderRoutes");
const mpesaRoutes = require("./routes/mpesaRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Create app
const app = express();

// ================= MIDDLEWARE =================
// Allow requests from frontend
app.use(cors({
    origin: "*"
}));

// Allows backend to read JSON from frontend
app.use(express.json());

// Serve uploaded product images
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// REQUEST LOGGER
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Bind routers
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// ================= DATABASE CONNECTION & ADMIN SEED =================
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "12345";
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const admin = new User({
                name: "System Administrator",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });
            await admin.save();
            console.log(`👥 Default admin seeded: ${adminEmail}`);
        } else {
            console.log("👥 Default admin verified.");
        }
    } catch (err) {
        console.error("❌ Seeding admin error:", err.message);
    }
};

// Connect to MongoDB
connectDB().then(() => {
    seedAdmin();
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});
