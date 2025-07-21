// backend/models/medicalBookingModel.js
const db = require("../config/db");

// Create a new medical booking
exports.createMedicalBooking = async (bookingData) => {
  try {
    console.log("Model: Creating medical booking with data:", bookingData);

    // Validate required fields
    if (!bookingData.user_id) {
      throw new Error("user_id is required");
    }
    if (!bookingData.vet_id) {
      throw new Error("vet_id is required");
    }

    const query = `
      INSERT INTO medical_bookings (
        user_id, vet_id, petName, petType, reason, ownerName, 
        phone, email, date, time, status, booking_identifier, booking_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      bookingData.user_id,
      bookingData.vet_id,
      bookingData.petName || '',
      bookingData.petType || '',
      bookingData.reason || '',
      bookingData.ownerName || '',
      bookingData.phone || '',
      bookingData.email || '',
      bookingData.date,
      bookingData.time,
      bookingData.status || 'pending',
      bookingData.booking_identifier,
      bookingData.booking_date
    ];

    console.log("Model: Executing query:", query);
    console.log("Model: With values:", values);

    const [result] = await db.execute(query, values);
    
    console.log("Model: Insert result:", result);

    if (!result.insertId) {
      throw new Error("Failed to insert medical booking - no insertId returned");
    }

    return result.insertId;
  } catch (error) {
    console.error("Error in createMedicalBooking model:", error);
    throw error;
  }
};

// Get medical bookings by user ID
exports.getMedicalBookingsByUser = async (userId) => {
  try {
    console.log("Model: Getting medical bookings for user:", userId);

    if (!userId) {
      throw new Error("userId is required");
    }

    const query = `
      SELECT mb.*, v.name as vet_name, v.specialization, v.clinic_name
      FROM medical_bookings mb
      LEFT JOIN veterinarians v ON mb.vet_id = v.id
      WHERE mb.user_id = ?
      ORDER BY mb.booking_date DESC
    `;

    const [rows] = await db.execute(query, [userId]);
    
    console.log("Model: Found medical bookings:", rows.length);

    return rows || [];
  } catch (error) {
    console.error("Error in getMedicalBookingsByUser model:", error);
    throw error;
  }
};

// Get medical booking by ID
exports.getMedicalBookingById = async (bookingId) => {
  try {
    console.log("Model: Getting medical booking by ID:", bookingId);

    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    const query = `
      SELECT mb.*, v.name as vet_name, v.specialization, v.clinic_name
      FROM medical_bookings mb
      LEFT JOIN veterinarians v ON mb.vet_id = v.id
      WHERE mb.id = ?
    `;

    const [rows] = await db.execute(query, [bookingId]);
    
    console.log("Model: Found medical booking:", rows.length > 0);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error in getMedicalBookingById model:", error);
    throw error;
  }
};

// Update medical booking status
exports.updateMedicalBookingStatus = async (bookingId, status) => {
  try {
    console.log("Model: Updating booking status:", { bookingId, status });

    if (!bookingId) {
      throw new Error("bookingId is required");
    }
    if (!status) {
      throw new Error("status is required");
    }

    const query = `
      UPDATE medical_bookings 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [status, bookingId]);
    
    console.log("Model: Update result:", result);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error in updateMedicalBookingStatus model:", error);
    throw error;
  }
};

// Delete medical booking
exports.deleteMedicalBooking = async (bookingId, userId) => {
  try {
    console.log("Model: Deleting medical booking:", { bookingId, userId });

    if (!bookingId) {
      throw new Error("bookingId is required");
    }
    if (!userId) {
      throw new Error("userId is required");
    }

    const query = `
      DELETE FROM medical_bookings 
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await db.execute(query, [bookingId, userId]);
    
    console.log("Model: Delete result:", result);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error in deleteMedicalBooking model:", error);
    throw error;
  }
};

// Get all medical bookings (admin function)
exports.getAllMedicalBookings = async () => {
  try {
    console.log("Model: Getting all medical bookings");

    const query = `
      SELECT mb.*, v.name as vet_name, v.specialization, v.clinic_name,
             u.name as user_name, u.email as user_email
      FROM medical_bookings mb
      LEFT JOIN veterinarians v ON mb.vet_id = v.id
      LEFT JOIN users u ON mb.user_id = u.id
      ORDER BY mb.booking_date DESC
    `;

    const [rows] = await db.execute(query);
    
    console.log("Model: Found total medical bookings:", rows.length);

    return rows || [];
  } catch (error) {
    console.error("Error in getAllMedicalBookings model:", error);
    throw error;
  }
};