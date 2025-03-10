// backend/controllers/shippingTaxController.js
const db = require("../config/db");

exports.getShippingTax = async (req, res) => {
  try {
    // Expect a POST body with an "orderItems" array: 
    // [{ productId: number, quantity: number }, ...]
    const { orderItems } = req.body;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

    // Get all unique product IDs from the order
    const productIds = [...new Set(orderItems.map(item => item.productId))];

    // Query the marketplace table for these products
    const [rows] = await db.query(
      "SELECT id, price, tax, shipping_cost FROM marketplace WHERE id IN (?)",
      [productIds]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "No products found for the given order items" });
    }

    // Create a lookup map from product id to its details
    const productMap = {};
    rows.forEach(product => {
      productMap[product.id] = product;
    });

    let totalTax = 0;
    // For shipping, assume the order shipping cost is the maximum shipping cost among items.
    let maxShippingCost = 0;

    // Loop through the order items and compute totals
    orderItems.forEach(item => {
      const product = productMap[item.productId];
      if (!product) return; // Skip if product not found (should not happen)
      
      // Calculate tax: price * quantity * (tax / 100)
      const productPrice = Number(product.price);
      const productTax = Number(product.tax); // assuming this is a percentage (e.g. 8.00 for 8%)
      totalTax += productPrice * item.quantity * (productTax / 100);

      // Determine the maximum shipping cost among items.
      const productShipping = Number(product.shipping_cost);
      if (productShipping > maxShippingCost) {
        maxShippingCost = productShipping;
      }
    });

    res.json({
      shippingCost: maxShippingCost.toFixed(2),
      tax: totalTax.toFixed(2)
    });
  } catch (error) {
    console.error("Error calculating shipping and tax:", error);
    res.status(500).json({ error: "Server error while calculating shipping and tax" });
  }
};
