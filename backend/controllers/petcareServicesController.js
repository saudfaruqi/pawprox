

// backend/controllers/petcareServicesController.js

const nodemailer              = require("nodemailer");
const dotenv                  = require("dotenv");
const petcareServicesModel    = require("../models/petcareServicesModel");

dotenv.config();

// 1) Configure Nodemailer transporter once
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 2) Helper to send a “new service” email to your admin inbox
async function sendNewServiceEmail(service) {
  const recipients = (process.env.CONTACT_EMAIL_RECIPIENTS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (!recipients.length) return;

  const mailOptions = {
    from:    `"Pawprox Alerts" <${process.env.SMTP_FROM}>`,
    to:      recipients.join(","),
    subject: `New Pet Care Service Added: ${service.name}`,
    html: `
      <h2>New Pet Care Service Created</h2>
      <ul>
        <li><strong>ID:</strong> ${service.id}</li>
        <li><strong>Name:</strong> ${service.name}</li>
        <li><strong>Description:</strong> ${service.description}</li>
        <li><strong>Price:</strong> ${service.price}</li>
        <li><strong>Availability:</strong> ${service.availability}</li>
        <li><strong>Features:</strong> ${service.features.join(", ")}</li>
      </ul>
      <p>Added on: ${new Date(service.created_at).toLocaleString()}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * GET /api/petcare
 * Retrieve all pet care services.
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await petcareServicesModel.getServices();
    return res.status(200).json({ items: services });
  } catch (error) {
    console.error("Error fetching pet care services:", error);
    return res.status(500).json({ error: "Server error while fetching pet care services" });
  }
};

/**
 * GET /api/petcare/:id
 * Retrieve a specific pet care service by ID.
 */
exports.getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await petcareServicesModel.getServiceById(id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    return res.status(200).json({ service });
  } catch (error) {
    console.error("Error fetching pet care service:", error);
    return res.status(500).json({ error: "Server error while fetching pet care service" });
  }
};

/**
 * POST /api/petcare
 * Create a new pet care service and email admin.
 */
exports.createService = async (req, res) => {
  const { name, description, price, availability, features } = req.body;

  if (!name || !description || !price || !availability) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1) Insert into DB
    const serviceId = await petcareServicesModel.createService({
      name,
      description,
      price,
      availability,
      features: features || []
    });

    const newService = {
      id:          serviceId,
      name,
      description,
      price,
      availability,
      features:    features || [],
      created_at:  new Date()
    };

    // 2) Fire‑and‑forget email notification
    sendNewServiceEmail(newService)
      .catch(err => console.error("Failed to send new‐service email:", err));

    return res
      .status(201)
      .json({ message: "Pet care service created successfully", serviceId });
  } catch (error) {
    console.error("Error creating pet care service:", error);
    return res
      .status(500)
      .json({ error: "Server error while creating pet care service" });
  }
};

/**
 * PUT /api/petcare/:id
 * Update an existing pet care service.
 */
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, availability, features } = req.body;

  try {
    const affectedRows = await petcareServicesModel.updateService(id, {
      name,
      description,
      price,
      availability,
      features
    });
    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Service not found or no changes made" });
    }
    return res
      .status(200)
      .json({ message: "Pet care service updated successfully" });
  } catch (error) {
    console.error("Error updating pet care service:", error);
    return res
      .status(500)
      .json({ error: "Server error while updating pet care service" });
  }
};

/**
 * DELETE /api/petcare/:id
 * Delete a pet care service.
 */
exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const affectedRows = await petcareServicesModel.deleteService(id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res
      .status(200)
      .json({ message: "Pet care service deleted successfully" });
  } catch (error) {
    console.error("Error deleting pet care service:", error);
    return res
      .status(500)
      .json({ error: "Server error while deleting pet care service" });
  }
};
