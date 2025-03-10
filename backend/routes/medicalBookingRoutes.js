// backend/routes/medicalBookingRoutes.js
const express = require("express");
const router = express.Router();
const { createMedicalBooking, getMedicalBookings } = require("../controllers/medicalBookingController");
const { protect } = require("../middlewares/authMiddleware");

// Protected routes for creating and retrieving medical bookings
router.post("/", protect, createMedicalBooking);
router.get("/", protect, getMedicalBookings);

module.exports = router;
