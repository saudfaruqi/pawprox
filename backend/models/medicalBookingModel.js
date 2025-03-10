// backend/models/medicalBookingModel.js
const db = require('../config/db');

/**
 * Create a new medical booking record.
 * @param {Object} bookingData - Data for the booking.
 * @returns {number} - The ID of the newly created booking.
 */
exports.createMedicalBooking = async (bookingData) => {
  const {
    user_id,
    vet_id,
    petName,
    petType,
    reason,
    ownerName,
    phone,
    email,
    date,
    time,
    status,
    booking_identifier,
    booking_date,
  } = bookingData;
  
  try {
    const [result] = await db.query(
      `INSERT INTO medical_bookings 
        (user_id, vet_id, petName, petType, reason, ownerName, phone, email, date, time, status, booking_identifier, booking_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        vet_id,
        petName,
        petType,
        reason,
        ownerName,
        phone,
        email,
        date,
        time,
        status,
        booking_identifier,
        booking_date
      ]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error inserting medical booking: " + error.message);
  }
};

/**
 * Retrieve medical bookings for a specific user.
 * @param {number} user_id
 * @returns {Array} - Array of booking records.
 */
exports.getMedicalBookingsByUser = async (user_id) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM medical_bookings WHERE user_id = ? ORDER BY booking_date DESC",
      [user_id]
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching medical bookings: " + error.message);
  }
};
