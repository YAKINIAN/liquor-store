const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { stkPush, handleCallback, stkQuery, confirmPayment } = require("../controllers/mpesaController");

router.post("/stkpush", authMiddleware, stkPush);
router.get("/status/:orderId", authMiddleware, stkQuery);
router.post("/confirm/:orderId", authMiddleware, confirmPayment);
router.post("/callback", handleCallback);

module.exports = router;
