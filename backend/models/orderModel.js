


//ordermodel.js

const db = require('../config/db');

exports.getOrdersByVendor = async (vendorId) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         o.*, 
         oi.quantity, 
         oi.price AS itemPrice, 
         p.title, 
         p.description, 
         p.image, 
         u.name AS buyerName, 
         u.email AS buyerEmail 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN marketplace p ON oi.product_id = p.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.vendor_id = ?
       ORDER BY o.created_at DESC`,
      [vendorId]
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};