// backend/routes/shippingTaxRoutes.js
const express = require("express");
const router = express.Router();
const { getShippingTax } = require("../controllers/shippingTaxController");
const { protect } = require("../middlewares/authMiddleware");

// Use POST so the client can send orderItems in the request body.
router.post("/", protect, getShippingTax);

module.exports = router;
