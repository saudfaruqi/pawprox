// backend/controllers/bookingController.js

const bookingModel = require('../models/bookingModel');
const userModel    = require('../models/userModel');
const nodemailer   = require('nodemailer');
const dotenv       = require('dotenv');
dotenv.config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper to send emails
async function sendBookingEmail(to, subject, html) {
  await transporter.sendMail({
    from:    `"Pawprox Bookings" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html
  });
}

/**
 * POST /api/bookings
 * Create a new booking and email confirmation.
 */
exports.createBooking = async (req, res) => {
  const user_id = req.user.id;

  // fetch the user record for email & username
  let userEmail, username;
  try {
    const user = await userModel.findUserById(user_id);
    userEmail = user?.email;
    username  = user?.username || user?.name || "Pet Lover";
  } catch (err) {
    console.error("Failed to load user for email:", err);
    username = "Pet Lover";
  }

  const {
    service_id,
    pet_name,
    pet_type,
    pet_weight,
    date,
    time,
    notes,
    emergency_contact,
    vaccination
  } = req.body;

  if (!service_id || !pet_name || !pet_type || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

const bookingData = {
  user_id:           req.user.id,
  vet_id:            req.body.vet_id,
  pet_name:          req.body.petName,
  pet_type:          req.body.petType,
  reason:            req.body.reason || "",
  owner_name:        req.body.ownerName,
  phone:             req.body.phone,
  email:             req.body.email,
  date:              req.body.date,
  time:              req.body.time,
  status:            req.body.status || "pending",
  booking_identifier:`MBK-${Date.now()}`,
  booking_date:      new Date()
};


  try {
    const bookingId = await bookingModel.createBooking(bookingData);

    // Send confirmation email (fire-and-forget)
    if (userEmail) {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">🐾 Your Pawprox Booking is Confirmed!</h2>
          <p>Hello ${username},</p>
          <p>We're excited to let you know that your pet care booking has been successfully confirmed. Below are your booking details:</p>

          <table style="border-collapse: collapse; margin-top: 10px;">
            <tr><td><strong>Booking ID:</strong></td><td>${bookingData.booking_identifier}</td></tr>
            <tr><td><strong>Pet Name:</strong></td><td>${bookingData.pet_name}</td></tr>
            <tr><td><strong>Pet Type:</strong></td><td>${bookingData.pet_type}</td></tr>
            <tr><td><strong>Pet Weight:</strong></td><td>${bookingData.pet_weight || 'Not specified'}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${bookingData.date}</td></tr>
            <tr><td><strong>Time:</strong></td><td>${bookingData.time}</td></tr>
            <tr><td><strong>Vaccination:</strong></td><td>${bookingData.vaccination}</td></tr>
          </table>

          <p style="margin-top: 10px;">If you have any questions or need to make changes, feel free to contact us at <a href="mailto:support@pawprox.com">support@pawprox.com</a>.</p>
          <p>Thank you for choosing Pawprox 🐶🐱</p>
        </div>
      `;

      sendBookingEmail(userEmail, "Your Pet Care Booking is Confirmed", html)
        .catch(err => console.error("Email send error:", err));
    }

    return res
      .status(201)
      .json({ message: 'Booking created successfully', bookingId });
  } catch (error) {
    console.error('Booking creation error:', error);
    return res
      .status(500)
      .json({ error: 'Server error while creating booking' });
  }
};

/**
 * GET /api/bookings
 * Retrieve all bookings for the logged-in user.
 */
exports.getBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const bookings = await bookingModel.getBookingsByUser(user_id);
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res
      .status(500)
      .json({ error: 'Server error while fetching bookings' });
  }
};

/**
 * PUT /api/bookings/:id
 * Update (reschedule) a booking and email the user.
 */
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { date, time, status } = req.body;

  // fetch user again for username & email
  let userEmail, username;
  try {
    const user = await userModel.findUserById(req.user.id);
    userEmail = user?.email;
    username  = user?.username || "there";
  } catch (err) {
    console.error("Failed to load user for update email:", err);
    username = "there";
  }

  try {
    const affected = await bookingModel.updateBooking(id, { date, time, status });
    if (!affected) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (userEmail) {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #FFA500;">🔁 Your Pawprox Booking Has Been Updated</h2>
          <p>Hi ${username},</p>
          <p>Your booking (ID: <strong>${id}</strong>) has been successfully updated. Here are the new details:</p>

          <table style="border-collapse: collapse; margin-top: 10px;">
            <tr><td><strong>New Date:</strong></td><td>${date}</td></tr>
            <tr><td><strong>New Time:</strong></td><td>${time}</td></tr>
            <tr><td><strong>Status:</strong></td><td>${status}</td></tr>
          </table>

          <p style="margin-top: 10px;">If you need further assistance, feel free to contact us anytime.</p>
          <p>Warm regards,<br/>The Pawprox Team 🐾</p>
        </div>
      `;

      sendBookingEmail(userEmail, 'Your Pet Care Booking Has Been Updated', html)
        .catch(err => console.error('Failed to send update email:', err));
    }

    return res.status(200).json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res
      .status(500)
      .json({ error: 'Server error while updating booking' });
  }
};

/**
 * DELETE /api/bookings/:id
 * Cancel a booking (mark as Cancelled) and email the user.
 */
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  // fetch user again for username & email
  let userEmail, username;
  try {
    const user = await userModel.findUserById(req.user.id);
    userEmail = user?.email;
    username  = user?.username || "there";
  } catch (err) {
    console.error("Failed to load user for cancel email:", err);
    username = "there";
  }

  try {
    const affected = await bookingModel.updateBooking(id, {
      date:   null,
      time:   null,
      status: 'Cancelled'
    });
    if (!affected) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (userEmail) {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #DC3545;">❌ Your Pawprox Booking Has Been Cancelled</h2>
          <p>Hello ${username},</p>
          <p>Your booking with ID <strong>${id}</strong> has been cancelled as requested. We're sad to see you go but we hope to welcome you back soon!</p>

          <p>If this was a mistake or you'd like to reschedule, please reach out to our support team at <a href="mailto:support@pawprox.com">support@pawprox.com</a>.</p>
          <p>Take care,<br/>Team Pawprox 🐶🐾</p>
        </div>
      `;

      sendBookingEmail(userEmail, 'Your Pet Care Booking Has Been Cancelled', html)
        .catch(err => console.error('Failed to send cancellation email:', err));
    }

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res
      .status(500)
      .json({ error: 'Server error while cancelling booking' });
  }
};
