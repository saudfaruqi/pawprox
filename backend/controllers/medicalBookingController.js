// backend/controllers/medicalBookingController.js
const medicalBookingModel = require("../models/medicalBookingModel");

/**
 * Create a new medical booking.
 * Endpoint: POST /api/medical-bookings
 */
exports.createMedicalBooking = async (req, res) => {
  // Assume req.user.id is set by your authentication middleware
  const user_id = req.user.id;
  const {
    vet_id,
    petName,
    petType,
    reason,
    ownerName,
    phone,
    email,
    date,
    time,
  } = req.body;
  
  // Basic validation: ensure required fields exist
  if (!vet_id || !petName || !petType || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const bookingData = {
    user_id,
    vet_id,
    petName,
    petType,
    reason: reason || "",
    ownerName: ownerName || "",
    phone: phone || "",
    email: email || "",
    date,
    time,
    status: "Confirmed", // You might want to start with "Pending" in a real app
    booking_identifier: Math.random().toString(36).substr(2, 9),
    booking_date: new Date(),
  };
  
  try {
    const bookingId = await medicalBookingModel.createMedicalBooking(bookingData);
    return res.status(201).json({ message: "Medical booking created successfully", bookingId });
  } catch (error) {
    console.error("Error creating medical booking:", error);
    return res.status(500).json({ error: "Server error while creating medical booking" });
  }
};

/**
 * Get medical bookings for the authenticated user.
 * Endpoint: GET /api/medical-bookings
 */
exports.getMedicalBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const bookings = await medicalBookingModel.getMedicalBookingsByUser(user_id);
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching medical bookings:", error);
    return res.status(500).json({ error: "Server error while fetching medical bookings" });
  }
};
