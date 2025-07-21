// backend/controllers/medicalBookingController.js

const nodemailer            = require("nodemailer");
const dotenv                = require("dotenv");
const medicalBookingModel   = require("../models/medicalBookingModel");

dotenv.config();

// ————————————————————————————————————————————————
// 1) Configure Nodemailer transporter once
// ————————————————————————————————————————————————
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ————————————————————————————————————————————————
// 2) Helper to send booking emails (user + admin)
// ————————————————————————————————————————————————
async function sendBookingEmails(booking) {
  try {
    const adminRecipients = (process.env.CONTACT_EMAIL_RECIPIENTS || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    // 2a) Confirmation email to user
    const userMail = {
      from:    process.env.SMTP_FROM,
      to:      booking.email,
      subject: "🐾 Your Veterinary Appointment is Confirmed",
      html: `
        <h2>Hello ${booking.ownerName},</h2>
        <p>Your medical booking for <strong>${booking.petName} (${booking.petType})</strong> has been confirmed.</p>
        <ul>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Reason:</strong> ${booking.reason}</li>
          <li><strong>Booking ID:</strong> ${booking.booking_identifier}</li>
        </ul>
        <p>Thank you for choosing Pawprox!</p>
        <p>— The Pawprox Team</p>
      `
    };

    // 2b) Alert email to admin(s)
    const adminMail = {
      from:    process.env.SMTP_FROM,
      to:      adminRecipients.join(","),
      subject: `New Vet Booking: ${booking.ownerName} (${booking.petName})`,
      html: `
        <h2>New Medical Booking Received</h2>
        <ul>
          <li><strong>User ID:</strong> ${booking.user_id}</li>
          <li><strong>Vet ID:</strong> ${booking.vet_id}</li>
          <li><strong>Owner:</strong> ${booking.ownerName}</li>
          <li><strong>Pet:</strong> ${booking.petName} (${booking.petType})</li>
          <li><strong>Reason:</strong> ${booking.reason}</li>
          <li><strong>Date & Time:</strong> ${booking.date} at ${booking.time}</li>
          <li><strong>Contact:</strong> ${booking.phone}, ${booking.email}</li>
          <li><strong>Booking ID:</strong> ${booking.booking_identifier}</li>
        </ul>
      `
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(userMail),
      adminRecipients.length > 0 ? transporter.sendMail(adminMail) : Promise.resolve()
    ]);
  } catch (error) {
    console.error("Error sending booking emails:", error);
  }
}

// ————————————————————————————————————————————————
// 3) Controller: Create a new booking + send emails
// ————————————————————————————————————————————————
exports.createMedicalBooking = async (req, res) => {
  try {
    // Debug logs
    console.log("=== DEBUG: createMedicalBooking ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    
    // Validate that user is authenticated
    if (!req.user || !req.user.id) {
      console.error("User not authenticated or user ID missing");
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Validate required fields
    const requiredFields = ['vet_id', 'petName', 'petType', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({ 
        error: "Missing required fields", 
        fields: missingFields 
      });
    }

    const bookingData = {
      user_id:            req.user.id,
      vet_id:             parseInt(req.body.vet_id),
      petName:            req.body.petName,
      petType:            req.body.petType,
      reason:             req.body.reason || "",
      ownerName:          req.body.ownerName || "",
      phone:              req.body.phone || "",
      email:              req.body.email || req.user.email || "",
      date:               req.body.date,
      time:               req.body.time,
      status:             req.body.status || "pending",
      booking_identifier: `MBK-${Date.now()}`,
      booking_date:       new Date()
    };

    console.log("Booking data to be inserted:", bookingData);

    // 1) Insert booking into database
    const insertId = await medicalBookingModel.createMedicalBooking(bookingData);
    
    if (!insertId) {
      throw new Error("Failed to create booking - no insert ID returned");
    }

    const newBooking = { id: insertId, ...bookingData };
    console.log("New booking created:", newBooking);

    // 2) Fire-and-forget email notifications
    if (bookingData.email) {
      sendBookingEmails(newBooking)
        .catch(err => console.error("Error sending booking emails:", err));
    }

    // 3) Respond to client
    return res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking
    });
  } catch (err) {
    console.error("Error in createMedicalBooking:", err);
    return res.status(500).json({ 
      error: "Server error while creating booking",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ————————————————————————————————————————————————
// 4) Controller: Retrieve bookings for user
// ————————————————————————————————————————————————
exports.getMedicalBookings = async (req, res) => {
  try {
    console.log("=== DEBUG: getMedicalBookings ===");
    console.log("req.user:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const bookings = await medicalBookingModel.getMedicalBookingsByUser(req.user.id);
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching medical bookings:", err);
    return res.status(500).json({ 
      error: "Server error while fetching bookings",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};