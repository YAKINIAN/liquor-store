// backend/models/user.js

// Import mongoose
const mongoose = require("mongoose");

// Create user schema (structure of user in DB)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // no duplicate emails
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    resetToken: String,
    resetTokenExpiry: Date
}, { timestamps: true });

// Export model
module.exports = mongoose.model("User", userSchema);