// ================= IMPORT =================
const mongoose = require("mongoose");

// ================= ORDER SCHEMA =================
const orderSchema = new mongoose.Schema({

    // Link order to a user (important later)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    // Items in cart
    items: [
        {
            id: mongoose.Schema.Types.Mixed,
            name: String,
            price: Number,
            qty: Number,
            image: String
        }
    ],

    // Delivery info
    delivery: {
        type: String
    },

    // Order status
    status: {
        type: String,
        default: "pending"
    },

    // 🔥 ADD THIS (RIGHT HERE)
    checkoutRequestID: String,

    payment: {
        receipt: String,
        phone: String,
        amount: Number
    }

}, {
    timestamps: true // auto adds createdAt, updatedAt
});



// ================= EXPORT =================
module.exports = mongoose.model("Order", orderSchema);