const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/Order"); // 🔥 ADD THIS

// Import controller
const { createOrder, getOrders } = require("../controllers/orderController");

// ================= ROUTES =================

const adminMiddleware = require("../middleware/adminMiddleware");

// POST /api/orders
router.post("/", authMiddleware, createOrder);

// GET /api/orders (user's own orders)
router.get("/", authMiddleware, getOrders);

// GET /api/orders/all (admin all orders)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        console.error("ADMIN FETCH ALL ORDERS ERROR:", err);
        res.status(500).json({ message: "Error fetching all orders" });
    }
});

// UPDATE ORDER STATUS (ADMIN ONLY)
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(order);

    } catch (err) {
        res.status(500).json({ message: "Error updating order" });
    }
});

// EXPORT ROUTER (VERY IMPORTANT)
module.exports = router;