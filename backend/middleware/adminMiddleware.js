const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Fetch user from DB to confirm role status
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Administrator privileges required." });
        }

        next();
    } catch (err) {
        console.error("Admin verification error:", err);
        return res.status(500).json({ message: "Internal server error during authorization check" });
    }
};
