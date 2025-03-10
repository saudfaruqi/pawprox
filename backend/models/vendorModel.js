

const db = require('../config/db');

exports.getVendorByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name AS contact_name, u.email, u.phone, u.location, u.profilePic
       FROM vendors v 
       JOIN users u ON v.user_id = u.id 
       WHERE v.user_id = ?`,
      [userId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error fetching vendor by user ID: " + error.message);
  }
};

exports.createVendor = async (vendorData) => {
  const { user_id, business_name, services, description } = vendorData;
  try {
    const [result] = await db.query(
      `INSERT INTO vendors (user_id, business_name, services, description)
       VALUES (?, ?, ?, ?)`,
      [user_id, business_name, services, description || '']
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating vendor: " + error.message);
  }
};

exports.updateVendor = async (userId, vendorData) => {
  const { business_name, services, description } = vendorData;
  try {
    const [result] = await db.query(
      `UPDATE vendors SET business_name = ?, services = ?, description = ? WHERE user_id = ?`,
      [business_name, services, description, userId]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error updating vendor: " + error.message);
  }
};
