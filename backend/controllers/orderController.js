const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
    try {

        console.log("🔥 ORDER HIT BACKEND");

        const { items, delivery } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const verifiedItems = [];

        // Check product existence, stock availability, and verify price from DB
        for (const item of items) {
            const product = await Product.findById(item.id);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }

            if (product.stock !== undefined && product.stock < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Trust DB price, not client-supplied price
            verifiedItems.push({
                id: product._id,
                name: product.name,
                price: product.price,
                qty: item.qty,
                image: product.image
            });
        }

        const newOrder = new Order({ 
            user: req.user.id, 
            items: verifiedItems, 
            delivery 
        });
        await newOrder.save();

        // Decrement stock
        for (const item of verifiedItems) {
            await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.qty } });
        }

        console.log("✅ ORDER SAVED TO DB");

        return res.status(201).json({ message: "Order created successfully", order: newOrder });

    } catch (err) {
        console.error("❌ ORDER ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= GET ALL ORDERS =================
exports.getOrders = async (req, res) => {
    try {
        console.log("📦 FETCHING ORDERS");

        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({ orders });

    } catch (err) {
        console.error("❌ FETCH ORDERS ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};