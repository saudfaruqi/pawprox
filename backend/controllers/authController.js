


// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

/**
 * User sign-up endpoint.
 */
// backend/controllers/authController.js

exports.signup = async (req, res) => {
  const { name, email, password, role, location, phone_number } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    // Check if user already exists.
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Include location and phone (mapping phone_number to phone)
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, location, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'user', location, phone_number]
    );
    
    // Generate JWT token after signup
    const token = jwt.sign(
      { id: result.insertId, role: role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
   const user = {
     id: result.insertId,
     name,
     email,
     role: role || 'user',
     location,
     phone: phone_number
   };
   return res.status(201).json({ 
     message: 'User created successfully', 
     user,
     token
   });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error during signup' });
  }
};


// backend/controllers/userController.js
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    // 1) fetch basic user
    const [[user]] = await db.query(
      `SELECT id, name, email, role, phone, created_at, preferences 
      FROM users WHERE id = ?`,
      [userId]
    );


    // 2) fetch their vendor record (if any)
    const [vendorRows] = await db.query(
      `SELECT id AS vendorId, business_name, services, approval_status 
       FROM vendors WHERE user_id = ?`,
      [userId]
    );
    const vendor = vendorRows.length ? vendorRows[0] : null;

    // 3) return both
    return res.json({ user, vendor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load profile' });
  }
};




/**
 * User login endpoint.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Upgrade a user to vendor by creating a vendor profile.
 */
exports.upgradeToVendor = async (req, res) => {
  const userId = req.user.id; // Set by auth middleware
  const { businessName, services } = req.body;
  if (!businessName || !services)
    return res.status(400).json({ error: 'Business name and services are required' });
  try {
    // Create vendor record with pending approval.
    const [result] = await db.query(
      'INSERT INTO vendors (user_id, business_name, services, approval_status) VALUES (?, ?, ?, ?)',
      [userId, businessName, services, 'pending']
    );
    // Optionally update user role to "vendor"
    await db.query('UPDATE users SET role = ? WHERE id = ?', ['vendor', userId]);
    return res.status(200).json({ message: 'Upgrade to vendor request submitted', vendorId: result.insertId });
  } catch (error) {
    console.error('Upgrade to vendor error:', error);
    return res.status(500).json({ error: 'Server error during vendor upgrade' });
  }
};


/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // 1) Find user
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // to prevent user enumeration, respond with 200 anyway
      return res.status(200).json({ message: 'If that email exists, a reset link was sent.' });
    }
    const userId = rows[0].id;

    // 2) Generate token & expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3) Save hashed token and expiry
    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [hashedToken, expires, userId]
    );

    // 4) Send email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"No Reply" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Your password reset link (valid for 1 hour)',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to set a new password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>If you didn’t request it, you can safely ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('Forgot password error', err);
    res.status(500).json({ error: 'Error sending reset link' });
  }
};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;
  if (!token || !email || !newPassword) {
    return res.status(400).json({ error: 'Token, email and new password are required' });
  }

  try {
    // 1) Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2) Find user by token, email, and expiry
    const [rows] = await db.query(
      `SELECT id FROM users 
       WHERE email = ? 
         AND reset_password_token = ? 
         AND reset_password_expires > ?`,
      [email, hashedToken, new Date()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token is invalid or has expired' });
    }

    // 3) Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users 
         SET password = ?, 
             reset_password_token = NULL, 
             reset_password_expires = NULL 
       WHERE id = ?`,
      [hashedPassword, rows[0].id]
    );

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error', err);
    res.status(500).json({ error: 'Could not reset password' });
  }
};