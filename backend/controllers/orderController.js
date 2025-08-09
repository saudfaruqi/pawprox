// orderController.js

const db = require("../config/db");
const orderModel = require("../models/orderModel");
const ordersModel = require("../models/ordersModel");
const nodemailer = require("nodemailer");

// Allowed statuses for validation
const allowedStatuses = [
  "processing",
  "ready",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled"
];

// ─── Inline SMTP / Nodemailer Setup ───────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT),   // e.g. 587
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,         // your SMTP user
    pass: process.env.SMTP_PASS          // your SMTP password / app password
  }
});

async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

// ─── Get orders for vendor ───────────────────────────────────────────────────

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

// ─── Create order (with email confirmation) ─────────────────────────────────

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

    // find vendor
    const [productRows] = await connection.query(
      "SELECT user_id FROM marketplace WHERE id = ?",
      [orderItems[0].productId]
    );
    if (!productRows.length) throw new Error("Product not found");
    const productUserId = productRows[0].user_id;

    const [vendorRows] = await connection.query(
      "SELECT id FROM vendors WHERE user_id = ?",
      [productUserId]
    );
    if (!vendorRows.length) throw new Error("Vendor not found for this product");
    const vendorId = vendorRows[0].id;

    // prepare payment meta
    const cardDigits = paymentDetails.cardNumber.replace(/\s+/g, "");
    const paymentMethod = `Credit Card (**** ${cardDigits.slice(-4)})`;

    // insert order
    const [result] = await connection.query(
      `INSERT INTO orders 
         (buyer_id, vendor_id, total_price, transaction_id, shipping_address, payment_method, tax, shipping_cost, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    // insert items & decrement stock
    for (const item of orderItems) {
      const price = Number(item.price);
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, price]
      );

      const [upd] = await connection.query(
        "UPDATE marketplace SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.productId, item.quantity]
      );
      if (!upd.affectedRows) throw new Error(`Insufficient stock for product ID ${item.productId}`);
    }

    await connection.commit();

    // ── Send order-placed email ───────────────────────────────────────────────
    await sendMail({
      to: paymentDetails.email,
      subject: `🧾 Order Confirmation – Order #${orderId}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #2e6c80;">Thank you for your order, ${paymentDetails.name}!</h2>
        <p>We're excited to confirm your purchase. Here are the details of your order:</p>

        <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Order ID:</td>
            <td style="padding: 8px;">#${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Date:</td>
            <td style="padding: 8px;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 8px;">${paymentDetails.amount}</td>   
          </tr>
        </table>

        <p style="margin-top: 20px;">We will send you a notification as soon as your order is shipped or its status changes.</p>

        <p>For any questions, feel free to reply to this email or contact our support team at <a href="mailto:support@pawprox.com">support@pawprox.com</a>.</p>

        <p style="margin-top: 30px;">Best regards,<br><strong>Pawprox</strong><br><em>Customer Success Team</em></p>
      </div>
      `
    });


    return res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Server error while creating order: " + error.message });
  } finally {
    connection.release();
  }
};

// ─── Update order status (with email notification) ──────────────────────────

exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = (req.body.status || "").toLowerCase();

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ error: "Invalid order status." });
  }

  try {
    // 1. update in DB
    await db.query(
      "UPDATE orders SET order_status = ? WHERE id = ?",
      [newStatus, orderId]
    );

    // 2. fetch buyer info
    const [[orderRow]] = await db.query(
      "SELECT buyer_id FROM orders WHERE id = ?",
      [orderId]
    );
    const [[userRow]] = await db.query(
      "SELECT name, email FROM users WHERE id = ?",
      [orderRow.buyer_id]
    );

    // 3. prepare email
    let subject, html;
    switch (newStatus) {

      case "processing":
      case "shipped":
      case "out for delivery":
        subject = `🔔 Order #${orderId} – Status Update: ${newStatus.toUpperCase()}`;
        html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2e6c80;">Your Order is Now ${newStatus.toUpperCase()}</h2>
          <p>Hi ${userRow.name},</p>
          <p>Your order <strong>#${orderId}</strong> has been updated. The current status is: <strong style="color: #444;">${newStatus.toUpperCase()}</strong>.</p>
          <p>We’ll continue to notify you as your order progresses.</p>
          <p style="margin-top: 30px;">Thanks again for choosing us!<br><strong>Pawprox</strong></p>
        </div>
        `;
        break;


      case "cancelled":
        subject = `❌ Order #${orderId} Has Been Cancelled`;
        html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #d9534f;">Order Cancelled – #${orderId}</h2>
          <p>Dear ${userRow.name},</p>
          <p>We're sorry to inform you that your order <strong>#${orderId}</strong> has been cancelled.</p>

          <p>If this was not intended, or if you have questions about the cancellation, please contact our support team immediately.</p>
          <p>Email: <a href="mailto:support@pawprox.com">support@pawprox.com</a></p>

          <p style="margin-top: 30px;">Best regards,<br><strong>Pawprox</strong></p>
        </div>
        `;
        break;

      case "delivered":
        subject = `🎉 Order #${orderId} Delivered Successfully!`;
        html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #5cb85c;">Your Order Has Arrived!</h2>
          <p>Hi ${userRow.name},</p>
          <p>We’re happy to let you know that your order <strong>#${orderId}</strong> has been successfully delivered.</p>

          <p>We hope you enjoy your purchase! If you have any feedback or need help with anything, feel free to reply to this email.</p>

          <p style="margin-top: 30px;">Thank you for shopping with us!<br><strong>Pawprox</strong></p>
        </div>
        `;
        break;

      default:
        subject = `ℹ️ Update on Your Order #${orderId}`;
        html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #2e6c80;">Order Status Update</h2>
          
          <p>Hi ${userRow.name},</p>
          
          <p>We're reaching out to inform you that the status of your order <strong>#${orderId}</strong> has been updated. The current status is now:</p>
          
          <p style="font-size: 16px; padding: 10px 15px; background-color: #f0f0f0; border-left: 4px solid #2e6c80; display: inline-block;">
            <strong style="color: #2e6c80; text-transform: capitalize;">${newStatus}</strong>
          </p>
          
          <p>If you have any questions about this update or need support, please don’t hesitate to reach out to us.</p>
          
          <p>You can reply directly to this email, or contact our support team at <a href="mailto:support@pawprox.com">support@pawprox.com</a>.</p>
          
          <p style="margin-top: 30px;">Thank you for shopping with us!<br><strong>Pawprox</strong><br><em>Customer Support</em></p>
        </div>
        `;
        break;

    }

    // 4. send notification
    await sendMail({ to: userRow.email, subject, html });

    return res.status(200).json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ error: "Server error while updating order status." });
  }
};

// ─── Get orders for a buyer ──────────────────────────────────────────────────

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

// ─── Get order by ID for a buyer ─────────────────────────────────────────────

exports.getOrderById = async (userId, orderId) => {
  const [orders] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
    [orderId, userId]
  );
  if (!orders.length) return null;

  const [items] = await db.query(
    `SELECT oi.*, m.title AS product_name, m.image AS product_image, m.description AS product_description
     FROM order_items oi
     JOIN marketplace m ON oi.product_id = m.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return { ...orders[0], items };
};

// ─── Reorder an existing order ───────────────────────────────────────────────

exports.reorderOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const payload = {
      buyerId: userId,
      orderItems: order.items.map(i => ({
        productId: i.product_id,
        quantity: i.quantity,
        price: i.price
      })),
      totalPrice: order.total_price,
      transactionId: "txn_" + Date.now(),
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      tax: order.tax,
      shippingCost: order.shipping_cost
    };

    const newOrderId = await ordersModel.createOrder(payload);
    return res.status(201).json({ message: "Order re-created successfully", orderId: newOrderId });
  } catch (error) {
    console.error("Error reordering order:", error);
    return res.status(500).json({ error: "Server error while reordering order: " + error.message });
  }
};

// ─── Update tracking info ───────────────────────────────────────────────────

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
    return res.status(200).json({ message: "Tracking information updated successfully." });
  } catch (error) {
    console.error("Error updating tracking info:", error);
    return res.status(500).json({ error: "Server error while updating tracking information." });
  }
};

// ─── Track an order ─────────────────────────────────────────────────────────

exports.trackOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;

  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!order.tracking_number) {
      return res.status(400).json({ error: "Tracking information is not available for this order." });
    }

    const createdDate = new Date(order.created_at);
    let statusLabel, eta;
    const s = order.order_status.toLowerCase();

    if (s === "shipped") {
      statusLabel = "Shipped";
      eta = new Date(createdDate);
      eta.setDate(eta.getDate() + 5);
    } else if (s === "out for delivery") {
      statusLabel = "Out for Delivery";
      eta = new Date(createdDate);
      eta.setDate(eta.getDate() + 6);
    } else if (s === "delivered") {
      statusLabel = "Delivered";
      eta = new Date(createdDate);
      eta.setDate(eta.getDate() + 7);
    } else {
      statusLabel = "Ready";
      eta = null;
    }

    return res.status(200).json({
      tracking: {
        orderId: order.id,
        trackingNumber: order.tracking_number,
        carrier: order.carrier_slug || "Default Carrier",
        status: statusLabel,
        estimatedDelivery: eta ? eta.toLocaleDateString("en-US") : ""
      }
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return res.status(500).json({ error: "Server error while tracking order." });
  }
};

// ─── Download HTML invoice ──────────────────────────────────────────────────

exports.downloadInvoice = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;

  try {
    const order = await ordersModel.getOrderById(userId, orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const [[buyer]] = await db.query(
      "SELECT name, email, phone FROM users WHERE id = ?",
      [userId]
    );
    const [[vendor]] = await db.query(
      `SELECT v.business_name, u.name AS contact_person, u.email AS vendor_email, u.phone AS vendor_phone
       FROM vendors v
       JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [order.vendor_id]
    );

    // compute totals
    const subtotal = order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const tax = Number(order.tax);
    const shipping = Number(order.shipping_cost);
    const grandTotal = subtotal + tax + shipping;

    // format dates
    const today = new Date();
    const fmt = d =>
      d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const formattedDate = fmt(today);
    const formattedOrderDate = fmt(new Date(order.created_at));
    const invoiceNumber = `INV-${order.id}-${Date.now().toString().slice(-6)}`;

    // build full HTML
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
                  ${order.payment_status ? order.payment_status.toUpperCase() : "PAID"}
                </p>
              </div>
              <div class="text-right">
                <h2 class="text-2xl font-bold">${vendor.business_name}</h2>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="p-8 border-b">
            <div class="flex flex-wrap -mx-4">
              <div class="w-full md:w-1/2 px-4 mb-6 md:mb-0">
                <h3 class="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">Bill To:</h3>
                <p class="font-bold text-lg">${buyer.name}</p>
                <p class="text-gray-700">${order.shipping_address}</p>
                <p class="text-gray-700">${buyer.email}</p>
                <p class="text-gray-700">${buyer.phone}</p>
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
                            ${order.order_status}
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
                <tbody>`;
    order.items.forEach((item, idx) => {
      const itemTotal = Number(item.price) * item.quantity;
      invoiceHtml += `
                  <tr class="${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                    <td class="py-4 px-4 border-b flex items-center">
                      ${
                        item.product_image
                          ? `<img src="${item.product_image.startsWith("data:")
                              ? item.product_image
                              : `${process.env.FRONTEND_URL.replace(/\/$/, "")}/${item.product_image}`
                            }" alt="${item.product_name}" class="w-12 h-12 object-cover rounded mr-4"/>`
                          : `<div class="w-12 h-12 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-500">No Image</div>`
                      }
                      <div>
                        <p class="font-medium text-gray-800">${item.product_name}</p>
                        <p class="text-xs text-gray-500 mt-1">${item.product_description?.substring(0,60) || ""}</p>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-center border-b">${item.quantity}</td>
                    <td class="py-4 px-4 text-right border-b">Rs ${Number(item.price).toFixed(2)}</td>
                    <td class="py-4 px-4 text-right border-b font-medium">Rs ${itemTotal.toFixed(2)}</td>
                  </tr>`;
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
                        <td class="py-3 px-4 text-right border-b font-semibold">Rs ${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-b">Tax</td>
                        <td class="py-3 px-4 text-right border-b font-semibold">Rs ${tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-b">Shipping</td>
                        <td class="py-3 px-4 text-right border-b font-semibold">Rs ${shipping.toFixed(2)}</td>
                      </tr>
                      <tr class="bg-gray-50">
                        <td class="py-3 px-4 font-bold">Total</td>
                        <td class="py-3 px-4 text-right font-bold text-blue-600">Rs ${grandTotal.toFixed(2)}</td>
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
              <h4 class="font-semibold mb-2">Thank you for shopping!</h4>
              <p>If you have any questions about this invoice, please contact us:</p>
              <p class="mt-1">${vendor.vendor_email} | ${vendor.vendor_phone}</p>
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
      </html>`;

    res.attachment(`invoice_${order.id}.html`);
    res.type("html");
    res.send(invoiceHtml);

  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(500).json({ error: "Server error while generating invoice." });
  }
};
