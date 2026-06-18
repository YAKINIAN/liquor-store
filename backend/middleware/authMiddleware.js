const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET is not set in environment");
        return res.status(500).json({ message: "Server misconfiguration" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
