


// ordersmodel.js
const db = require("../config/db");

exports.createOrder = async ({ 
  buyerId, 
  orderItems, 
  totalPrice, 
  transactionId, 
  shippingAddress, 
  paymentMethod, 
  tax, 
  shippingCost 
}) => {
  if (!orderItems || !orderItems.length) {
    throw new Error("Order items array is empty or invalid");
  }

  // Get vendor information based on the first order item's product
  const [productRows] = await db.query(
    "SELECT user_id FROM marketplace WHERE id = ?",
    [orderItems[0].productId]
  );
  if (!productRows || productRows.length === 0) {
    throw new Error("Product not found");
  }
  const productUserId = productRows[0].user_id;

  const [vendorRows] = await db.query(
    "SELECT id FROM vendors WHERE user_id = ?",
    [productUserId]
  );
  if (!vendorRows || vendorRows.length === 0) {
    throw new Error("Vendor not found for this product");
  }
  const vendorId = vendorRows[0].id;

  // Convert tax and shippingCost to numbers
  const numericTax = tax ? Number(tax) : 0;
  const numericShippingCost = shippingCost ? Number(shippingCost) : 0;

  // Insert the order with tax and shipping cost
  const [result] = await db.query(
    "INSERT INTO orders (buyer_id, vendor_id, total_price, transaction_id, shipping_address, payment_method, tax, shipping_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [buyerId, vendorId, totalPrice, transactionId, shippingAddress, paymentMethod, numericTax, numericShippingCost]
  );
  const orderId = result.insertId;

  // Insert each order item into the order_items table
  for (const item of orderItems) {
    const itemPrice = Number(item.price);
    await db.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [orderId, item.productId, item.quantity, itemPrice]
    );

    // Update the product stock
    const [updateResult] = await db.query(
      "UPDATE marketplace SET stock = stock - ? WHERE id = ? AND stock >= ?",
      [item.quantity, item.productId, item.quantity]
    );
    if (updateResult.affectedRows === 0) {
      throw new Error(`Insufficient stock for product ID ${item.productId}`);
    }
  }

  return orderId;
};


exports.getOrders = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          o.id as order_id,
          o.created_at,
          o.total_price,
          o.order_status,
          o.shipping_address,
          o.payment_method,
          o.tax,
          o.shipping_cost,
          oi.quantity,
          oi.price as item_price,
          m.title as product_name,
          m.image as product_image,
          m.description as product_description
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN marketplace m ON oi.product_id = m.id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Group rows by order_id to aggregate order items
    const ordersMap = {};
    rows.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          created_at: row.created_at,
          total_price: row.total_price,
          order_status: row.order_status,
          shipping_address: row.shipping_address,
          payment_method: row.payment_method,
          tax: row.tax,
          shipping_cost: row.shipping_cost,
          items: []
        };
      }
      if (row.product_name) {
        ordersMap[row.order_id].items.push({
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.item_price,
          product_image: row.product_image,
          product_description: row.product_description,
        });
      }
    });
    return Object.values(ordersMap);
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

exports.getOrderById = async (userId, orderId) => {
  const [orders] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
    [orderId, userId]
  );
  if (orders.length === 0) return null;
  
  const [orderItems] = await db.query(
    `SELECT 
       oi.*, 
       m.title AS product_name, 
       m.image AS product_image, 
       m.description AS product_description 
     FROM order_items oi 
     JOIN marketplace m ON oi.product_id = m.id 
     WHERE oi.order_id = ?`,
    [orderId]
  );
  
  return { ...orders[0], items: orderItems };
};

exports.getOrdersForVendor = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const orders = await require("../models/orderModel").getOrdersByVendor(vendorId);
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders for vendor:", error);
    res.status(500).json({ error: "Server error while fetching orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;
  try {
    const [result] = await db.query(
      "UPDATE orders SET order_status = ? WHERE id = ?",
      [newStatus, orderId]
    );
    res.status(200).json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Server error while updating order status." });
  }
};