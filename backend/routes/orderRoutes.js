

const express = require("express");
const router = express.Router();
const { getOrdersForVendor } = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

// For vendor orders
router.get("/vendor", protect, getOrdersForVendor);

module.exports = router;
