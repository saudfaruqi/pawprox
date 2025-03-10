// backend/controllers/bookingController.js
const bookingModel = require('../models/bookingModel');

/**
 * Create a new booking.
 * Endpoint: POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  // Assume req.user.id is set by authentication middleware
  const user_id = req.user.id;
  const {
    service_id,
    pet_name,
    pet_type,
    pet_weight,
    date,
    time,
    notes,
    emergency_contact,
    veterinarian,
    vaccination
  } = req.body;

  // Validate required fields
  if (!service_id || !pet_name || !pet_type || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Build booking data object
  const bookingData = {
    user_id,
    service_id,
    pet_name,
    pet_type,
    pet_weight: pet_weight || null,
    date,
    time,
    notes: notes || null,
    emergency_contact: emergency_contact || null,
    veterinarian: veterinarian || null,
    vaccination: vaccination || 'unknown',
    status: 'Confirmed', // or set to 'Pending' as needed
    booking_identifier: Math.random().toString(36).substr(2, 9),
    booking_date: new Date()
  };

  try {
    const bookingId = await bookingModel.createBooking(bookingData);
    return res.status(201).json({ message: "Booking created successfully", bookingId });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({ error: "Server error while creating booking" });
  }
};

/**
 * Get bookings for the logged-in user.
 * Endpoint: GET /api/bookings
 */
exports.getBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const bookings = await bookingModel.getBookingsByUser(user_id);
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Server error while fetching bookings" });
  }
};
