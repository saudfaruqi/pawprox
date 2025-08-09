// models/vendorModel.js
const db = require('../config/db');

/**
 * Fetch a vendor (with user contact info) by the user’s ID
 */
exports.getVendorByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, 
              u.name    AS contact_name,
              u.email,
              u.phone,
              u.location,
              u.profilePic
       FROM vendors v
       JOIN users  u ON v.user_id = u.id
       WHERE v.user_id = ?`,
      [userId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error fetching vendor by user ID: " + error.message);
  }
};

/**
 * Create a new vendor application
 */
exports.createVendor = async (vendorData) => {
  const { user_id, business_name, services, description } = vendorData;
  try {
    const [result] = await db.query(
      `INSERT INTO vendors 
         (user_id, business_name, services, description /* approval_status uses the default 'pending' */)
       VALUES (?, ?, ?, ?)`,
      [user_id, business_name, services, description || '']
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating vendor: " + error.message);
  }
};

/**
 * Update an existing vendor by the user’s ID
 * (used when the user edits their vendor profile)
 */
exports.updateVendor = async (userId, vendorData) => {
  const { business_name, services, description } = vendorData;
  try {
    const [result] = await db.query(
      `UPDATE vendors
         SET business_name = ?,
             services      = ?,
             description   = ?,
             updated_at    = NOW()
       WHERE user_id = ?`,
      [business_name, services, description, userId]
    );
    return result.affectedRows; // 1 if updated, 0 if no row
  } catch (error) {
    throw new Error("Error updating vendor: " + error.message);
  }
};

/**
 * Update a vendor by vendor ID, including changing approval_status
 * (used for re-applying after a rejection)
 */
exports.updateVendorById = async (vendorId, data) => {
  const { business_name, services, description, approval_status } = data;
  try {
    const [result] = await db.query(
      `UPDATE vendors
         SET business_name   = ?,
             services        = ?,
             description     = ?,
             approval_status = ?,
             updated_at      = NOW()
       WHERE id = ?`,
      [business_name, services, description, approval_status, vendorId]
    );
    return result.affectedRows; // 1 if updated, 0 otherwise
  } catch (error) {
    throw new Error("Error updating vendor by ID: " + error.message);
  }
};
