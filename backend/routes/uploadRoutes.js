const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files are allowed"));
    }
});

// POST /api/upload  (admin only)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const imageUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

module.exports = router;
