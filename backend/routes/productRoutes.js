const express = require("express");
const router = express.Router();

const Product = require("../models/Product");


// ================= GET ALL PRODUCTS =================
// Supports search, category, brand
router.get("/", async (req, res) => {

    try {

        const { search, category, brand } = req.query;

        let filter = {};

        // 🔍 SEARCH BY NAME
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // 📂 FILTER BY CATEGORY
        if (category) {
            filter.category = category;
        }

        // 🏷 FILTER BY BRAND
        if (brand) {
            filter.brand = brand;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json(products);

    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});


const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ================= GET FEATURED PRODUCTS =================
router.get("/featured", async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).limit(16);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ================= GET SINGLE PRODUCT =================
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("GET PRODUCT BY ID ERROR:", error);
        res.status(500).json({ message: "Server error or invalid ID format" });
    }
});


// ================= CREATE PRODUCT (ADMIN) =================
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
});


// ================= UPDATE PRODUCT (ADMIN) =================
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});


// ================= DELETE PRODUCT (ADMIN) =================
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;