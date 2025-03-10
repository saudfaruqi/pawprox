// backend/controllers/adminController.js
const db = require('../config/db');

/**
 * Get all users (for admin view)
 */
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Server error while fetching users' });
  }
};

/**
 * Approve a vendor's application.
 */
exports.approveVendor = async (req, res) => {
  const { vendorId } = req.body;
  if (!vendorId)
    return res.status(400).json({ error: 'Vendor ID is required' });
  try {
    const [result] = await db.query(
      'UPDATE vendors SET approval_status = ? WHERE id = ?',
      ['approved', vendorId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    return res.status(200).json({ message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Error approving vendor:', error);
    return res.status(500).json({ error: 'Server error while approving vendor' });
  }
};
