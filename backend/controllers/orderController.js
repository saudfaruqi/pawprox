const db = require("../config/db");
const orderModel = require("../models/orderModel");
const ordersModel = require("../models/ordersModel");

// Allowed statuses for validation
const allowedStatuses = [
  "processing",
  "ready",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled"
];

// Get orders for vendor
exports.getOrdersForVendor = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const orders = await orderModel.getOrdersByVendor(vendorId);
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders for vendor:", error);
    res.status(500).json({ error: "Server error while fetching orders" });
  }
};

// Create order (tracking fields are not set at creation time)
// Now explicitly set default status to "Processing"
exports.createOrder = async (req, res) => {
  console.log("Order payload:", req.body);
  const { orderItems, paymentDetails } = req.body;
  
  if (!orderItems || !orderItems.length) {
    return res.status(400).json({ error: "Order items array is empty or invalid" });
  }
  
  const buyerId = req.user.id;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [productRows] = await connection.query(
      "SELECT user_id FROM marketplace WHERE id = ?",
      [orderItems[0].productId]
    );
    if (!productRows || productRows.length === 0) {
      throw new Error("Product not found");
    }
    const productUserId = productRows[0].user_id;
    
    const [vendorRows] = await connection.query(
      "SELECT id FROM vendors WHERE user_id = ?",
      [productUserId]
    );
    if (!vendorRows || vendorRows.length === 0) {
      throw new Error("Vendor not found for this product");
    }
    const vendorId = vendorRows[0].id;
    
    const cardNumberDigits = paymentDetails.cardNumber.replace(/\s+/g, '');
    const paymentMethod = `Credit Card (**** ${cardNumberDigits.slice(-4)})`;

    // Insert the order with default status "Processing"
    const [result] = await connection.query(
      "INSERT INTO orders (buyer_id, vendor_id, total_price, transaction_id, shipping_address, payment_method, tax, shipping_cost, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        buyerId,
        vendorId,
        paymentDetails.totalPrice,
        paymentDetails.transactionId || "txn_123456",
        paymentDetails.shippingAddress,
        paymentMethod,
        paymentDetails.tax,
        paymentDetails.shippingCost,
        "Processing"
      ]
    );
    
    const orderId = result.insertId;
    
    for (const item of orderItems) {
      const itemPrice = Number(item.price);
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, itemPrice]
      );
      
      const [updateResult] = await connection.query(
        "UPDATE marketplace SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.productId, item.quantity]
      );
      
      if (updateResult.affectedRows === 0) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }
    }
    
    await connection.commit();
    res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Server error while creating order: " + error.message });
  } finally {
    connection.release();
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;
  // Validate the new status against allowed statuses
  if (!newStatus || !allowedStatuses.includes(newStatus.toLowerCase())) {
    return res.status(400).json({ error: "Invalid order status." });
  }
  
  try {
    await db.query(
      "UPDATE orders SET order_status = ? WHERE id = ?",
      [newStatus, orderId]
    );
    res.status(200).json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Server error while updating order status." });
  }
};

// Get orders for a buyer
exports.getOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await ordersModel.getOrders(userId);
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Server error while fetching orders" });
  }
};

// Get order by ID (for a buyer)
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

// Reorder an order
exports.reorderOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const newOrderPayload = {
      buyerId: userId,
      orderItems: order.items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: order.total_price,
      transactionId: "txn_" + Date.now(),
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      tax: order.tax,
      shippingCost: order.shipping_cost,
      order_status: "Processing" // New orders start as Processing
    };

    const newOrderId = await ordersModel.createOrder(newOrderPayload);
    return res.status(201).json({ message: "Order re-created successfully", orderId: newOrderId });
  } catch (error) {
    console.error("Error reordering order:", error);
    return res.status(500).json({ error: "Server error while reordering order: " + error.message });
  }
};

// Update tracking information for an order
exports.updateTracking = async (req, res) => {
  const orderId = req.params.orderId;
  const { tracking_number, carrier_slug } = req.body;
  
  if (!tracking_number) {
    return res.status(400).json({ error: "Tracking number is required." });
  }
  
  try {
    await db.query(
      "UPDATE orders SET tracking_number = ?, carrier_slug = ? WHERE id = ?",
      [tracking_number, carrier_slug || null, orderId]
    );
    res.status(200).json({ message: "Tracking information updated successfully." });
  } catch (error) {
    console.error("Error updating tracking info:", error);
    res.status(500).json({ error: "Server error while updating tracking information." });
  }
};

// Tracking endpoint using your own logic
exports.trackOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  
  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!order.tracking_number) {
      return res.status(400).json({ error: "Tracking information is not available for this order." });
    }
    
    const createdDate = new Date(order.created_at);
    let trackingStatus = "";
    let estimatedDelivery = "";
    
    const status = order.order_status.toLowerCase();
    if (status === "shipped") {
      trackingStatus = "Shipped";
      let ed = new Date(createdDate);
      ed.setDate(ed.getDate() + 5);
      estimatedDelivery = ed.toLocaleDateString("en-US");
    } else if (status === "out for delivery") {
      trackingStatus = "Out for Delivery";
      let ed = new Date(createdDate);
      ed.setDate(ed.getDate() + 6);
      estimatedDelivery = ed.toLocaleDateString("en-US");
    } else if (status === "delivered") {
      trackingStatus = "Delivered";
      let ed = new Date(createdDate);
      ed.setDate(ed.getDate() + 7);
      estimatedDelivery = ed.toLocaleDateString("en-US");
    } else {
      // For statuses like processing, ready, or cancelled, return tracking info with status "Ready" and no estimated delivery.
      trackingStatus = "Ready";
      estimatedDelivery = "";
    }
    
    const trackingDetails = {
      orderId: order.id,
      trackingNumber: order.tracking_number,
      carrier: order.carrier_slug || "Default Carrier",
      status: trackingStatus,
      estimatedDelivery,
    };
    
    return res.status(200).json({ tracking: trackingDetails });
  } catch (error) {
    console.error("Error tracking order:", error.message);
    return res.status(500).json({ error: "Server error while tracking order." });
  }
};



// Download Invoice for an Order
exports.downloadInvoice = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [buyer] = await db.query(
      "SELECT name, email, phone FROM users WHERE id = ?",
      [userId]
    );

    const [vendor] = await db.query(
      "SELECT v.business_name, u.name as contact_person FROM vendors v JOIN users u ON v.user_id = u.id WHERE v.id = ?",
      [order.vendor_id]
    );

    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const tax = Number(order.tax);
    const shipping = Number(order.shipping_cost);
    const grandTotal = subtotal + tax + shipping;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
    const orderDate = new Date(order.created_at);
    const formattedOrderDate = orderDate.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    const invoiceNumber = `INV-${order.id}-${Date.now().toString().slice(-6)}`;

    const paymentStatus = order.payment_status || "Paid";
    const orderStatus = order.order_status || "Processing";

    let invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoiceNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 font-sans">
        <div class="max-w-4xl mx-auto bg-white shadow-lg my-8 print:shadow-none print:my-0">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-t-lg print:rounded-none">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold">INVOICE</h1>
                <p class="text-blue-100">#${invoiceNumber}</p>
                <p class="mt-2 text-blue-100">Issued: ${formattedDate}</p>
                <p class="text-blue-100">Order Date: ${formattedOrderDate}</p>
                <p class="mt-4 px-3 py-1 bg-blue-500 inline-block rounded-full text-sm font-semibold">
                  ${paymentStatus.toUpperCase()}
                </p>
              </div>
              <div class="text-right">
                <h2 class="text-2xl font-bold">${vendor?.[0]?.business_name || 'Company Name'}</h2>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="p-8 border-b">
            <div class="flex flex-wrap -mx-4">
              <div class="w-full md:w-1/2 px-4 mb-6 md:mb-0">
                <h3 class="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">Bill To:</h3>
                <p class="font-bold text-lg">${buyer?.[0]?.name || 'Customer Name'}</p>
                <p class="text-gray-700">${order.shipping_address}</p>
                <p class="text-gray-700">${buyer?.[0]?.email || 'customer@example.com'}</p>
                <p class="text-gray-700">${buyer?.[0]?.phone || ''}</p>
              </div>
              <div class="w-full md:w-1/2 px-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <table class="w-full text-sm">
                    <tbody>
                      <tr>
                        <td class="py-2 text-gray-600">Invoice Number:</td>
                        <td class="py-2 text-right font-semibold">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td class="py-2 text-gray-600">Order ID:</td>
                        <td class="py-2 text-right font-semibold">#${order.id}</td>
                      </tr>
                      <tr>
                        <td class="py-2 text-gray-600">Order Date:</td>
                        <td class="py-2 text-right">${formattedOrderDate}</td>
                      </tr>
                      <tr>
                        <td class="py-2 text-gray-600">Payment Method:</td>
                        <td class="py-2 text-right">${order.payment_method}</td>
                      </tr>
                      <tr>
                        <td class="py-2 text-gray-600">Order Status:</td>
                        <td class="py-2 text-right">
                          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            ${orderStatus}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-8">
            <h3 class="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-4">Order Items</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="py-3 px-4 text-left font-semibold text-gray-600 border-b">Item</th>
                    <th class="py-3 px-4 text-center font-semibold text-gray-600 border-b">Quantity</th>
                    <th class="py-3 px-4 text-right font-semibold text-gray-600 border-b">Unit Price</th>
                    <th class="py-3 px-4 text-right font-semibold text-gray-600 border-b">Amount</th>
                  </tr>
                </thead>
                <tbody>
    `;
    order.items.forEach((item, index) => {
      const itemSubtotal = Number(item.price) * Number(item.quantity);
      invoiceHtml += `
        <tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
          <td class="py-4 px-4 border-b">
            <div class="flex items-center">
              ${
                item.product_image
                  ? `<div class="w-12 h-12 mr-4 bg-gray-200 rounded overflow-hidden">
                      <img src="${
                        item.product_image.startsWith("data:")
                          ? item.product_image
                          : "http://localhost:5001/" + item.product_image
                      }" alt="${item.product_name}" class="w-full h-full object-cover">
                    </div>`
                  : `<div class="w-12 h-12 mr-4 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                      <span>No Image</span>
                    </div>`
              }
              <div>
                <p class="font-medium text-gray-800">${item.product_name}</p>
                <p class="text-xs text-gray-500 mt-1">${
                  item.product_description
                    ? item.product_description.substring(0, 60) +
                      (item.product_description.length > 60 ? "..." : "")
                    : "No description"
                }</p>
              </div>
            </div>
          </td>
          <td class="py-4 px-4 text-center border-b">${item.quantity}</td>
          <td class="py-4 px-4 text-right border-b">$${Number(item.price).toFixed(2)}</td>
          <td class="py-4 px-4 text-right border-b font-medium">$${itemSubtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    invoiceHtml += `
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="mt-8 flex justify-end">
              <div class="w-full md:w-1/2 lg:w-1/3">
                <div class="border rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b">
                    <h4 class="font-semibold text-gray-600">Order Summary</h4>
                  </div>
                  <table class="w-full text-sm">
                    <tbody>
                      <tr>
                        <td class="py-3 px-4 border-b">Subtotal</td>
                        <td class="py-3 px-4 text-right border-b font-semibold">$${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-b">Tax</td>
                        <td class="py-3 px-4 text-right border-b font-semibold">$${tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-b">Shipping</td>
                        <td class="py-3 px-4 text-right border-b font-semibold">$${shipping.toFixed(2)}</td>
                      </tr>
                      <tr class="bg-gray-50">
                        <td class="py-3 px-4 font-bold">Total</td>
                        <td class="py-3 px-4 text-right font-bold text-blue-600">$${grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-8 bg-gray-50 rounded-b-lg print:rounded-none">
            <div class="border-t pt-8 text-center text-gray-600 text-sm">
              <h4 class="font-semibold mb-2">Thank you for your business!</h4>
              <p>If you have any questions about this invoice, please contact us:</p>
              <p class="mt-1">${vendor?.[0]?.email || "support@example.com"} | ${vendor?.[0]?.phone || "(123) 456-7890"}</p>
              <div class="mt-6 text-xs text-gray-500">
                <p>Invoice created on ${formattedDate}</p>
                <p>Reference: ${invoiceNumber}</p>
              </div>
            </div>
          </div>

          <!-- Print button -->
          <div class="p-4 text-center print:hidden">
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition duration-150 ease-in-out">
              Print Invoice
            </button>
          </div>
        </div>
      </body>
      </html>
    `;

    res.attachment(`invoice_${order.id}.html`);
    res.type("html");
    res.send(invoiceHtml);
  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(500).json({ error: "Server error while generating invoice." });
  }
};


