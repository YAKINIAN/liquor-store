const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // 🔍 Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔒 Compare hashed passwords securely
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔥 CREATE TOKEN
        const token = jwt.sign(
            { id: user._id, role: user.role || "user" },
            process.env.JWT_SECRET || "fallback_secure_key_32_chars_long_for_dev_only",
            { expiresIn: "7d" }
        );

        return res.json({
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

        console.error("LOGIN ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};