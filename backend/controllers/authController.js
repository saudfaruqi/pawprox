


// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    
    return res.status(201).json({ 
      message: 'User created successfully', 
      userId: result.insertId,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error during signup' });
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
