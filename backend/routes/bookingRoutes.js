// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { createBooking, getBookings } = require("../controllers/bookingController");
const { protect } = require("../middlewares/authMiddleware");

// Create a new booking (protected route)
router.post("/", protect, createBooking);

// Get bookings for the authenticated user (protected route)
router.get("/", protect, getBookings);

module.exports = router;
