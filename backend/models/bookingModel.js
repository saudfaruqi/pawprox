// backend/models/bookingModel.js
const db = require('../config/db');

/**
 * Create a new booking record.
 * @param {Object} bookingData - Contains user_id, service_id, pet_name, pet_type, pet_weight, date, time, notes, emergency_contact, veterinarian, vaccination, status, booking_identifier, booking_date.
 * @returns {number} - The ID of the newly created booking.
 */
exports.createBooking = async (bookingData) => {
  const {
    user_id,
    service_id,
    pet_name,
    pet_type,
    pet_weight,
    date,
    time,
    notes,
    emergency_contact,
    veterinarian,
    vaccination,
    status,
    booking_identifier,
    booking_date
  } = bookingData;
  try {
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, service_id, pet_name, pet_type, pet_weight, date, time, notes, emergency_contact, veterinarian, vaccination, status, booking_identifier, booking_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        service_id,
        pet_name,
        pet_type,
        pet_weight,
        date,
        time,
        notes,
        emergency_contact,
        veterinarian,
        vaccination,
        status,
        booking_identifier,
        booking_date
      ]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating booking: " + error.message);
  }
};

/**
 * (Optional) Retrieve bookings for a specific user.
 * @param {number} user_id - ID of the user.
 * @returns {Array} - Array of booking records.
 */
exports.getBookingsByUser = async (user_id) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC",
      [user_id]
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};
