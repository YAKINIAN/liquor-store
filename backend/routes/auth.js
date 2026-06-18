// backend/routes/auth.js
console.log("✅ AUTH ROUTES LOADED");

const express = require("express");
const router = express.Router();

// Import User model
const User = require("../models/User");

// Import bcrypt for password hashing
const bcrypt = require("bcryptjs");

// Import JWT
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("📥 LOGIN ATTEMPT:", email);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ USER NOT FOUND");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ PASSWORD WRONG");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create token containing role
        const token = jwt.sign(
            { id: user._id, role: user.role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user"
            }
        });

    } catch (err) {
        console.error("🔥 LOGIN ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Import middleware for admin endpoints
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ================= VERIFY ADMIN =================
router.get("/verify-admin", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ valid: true, message: "Authorized admin" });
});

// ================= GET ALL USERS (ADMIN) =================
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "If that email is registered, a reset link has been sent." });
        }

        const crypto = require("crypto");
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Respond immediately — don't wait for email
        res.json({ message: "If that email is registered, a reset link has been sent." });

        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost"}/resetpassword.html?token=${token}`;
        console.log(`🔑 RESET LINK (dev): ${resetUrl}`);
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        transporter.sendMail({
            from: `"Liquor Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password — Liquor Store",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0a0a0a;color:#e0e0e0;border-radius:8px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <div style="font-size:36px;">🍷</div>
                        <h2 style="color:#d4af37;letter-spacing:2px;margin:8px 0 4px;">LIQUOR STORE</h2>
                        <p style="color:#777;font-size:13px;margin:0;">PREMIUM SPIRITS · NAIROBI</p>
                    </div>
                    <h3 style="color:#fff;margin-bottom:12px;">Password Reset Request</h3>
                    <p style="color:#aaa;line-height:1.7;">Click the button below to set a new password. This link expires in <strong style="color:#d4af37;">1 hour</strong>.</p>
                    <div style="text-align:center;margin:28px 0;">
                        <a href="${resetUrl}" style="background:#d4af37;color:#111;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">Reset Password</a>
                    </div>
                    <p style="color:#555;font-size:12px;">If you didn't request this, ignore this email.</p>
                </div>
            `
        }).catch(err => console.error("📧 Email send failed:", err.message));

    } catch (err) {
        console.error("FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password || password.length < 6) {
            return res.status(400).json({ message: "Invalid request." });
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or has expired." });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: "Password updated successfully." });
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================= UPDATE PROFILE =================
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, password } = req.body;
        const update = {};
        if (name) update.name = name;
        if (password) update.password = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
        res.json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;