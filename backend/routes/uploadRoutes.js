const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files are allowed"));
    }
});

router.post("/", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "liquor-products"
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
});

module.exports = router;