// backend/controllers/petcareServicesController.js
const petcareServicesModel = require("../models/petcareServicesModel");

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
 * Create a new pet care service.
 */
exports.createService = async (req, res) => {
  const { name, description, price, availability, features } = req.body;
  if (!name || !description || !price || !availability) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const serviceId = await petcareServicesModel.createService({
      name,
      description,
      price,
      availability,
      features: features || []
    });
    return res.status(201).json({ message: "Pet care service created successfully", serviceId });
  } catch (error) {
    console.error("Error creating pet care service:", error);
    return res.status(500).json({ error: "Server error while creating pet care service" });
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
    const affectedRows = await petcareServicesModel.updateService(id, { name, description, price, availability, features });
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Service not found or no changes made" });
    }
    return res.status(200).json({ message: "Pet care service updated successfully" });
  } catch (error) {
    console.error("Error updating pet care service:", error);
    return res.status(500).json({ error: "Server error while updating pet care service" });
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
    return res.status(200).json({ message: "Pet care service deleted successfully" });
  } catch (error) {
    console.error("Error deleting pet care service:", error);
    return res.status(500).json({ error: "Server error while deleting pet care service" });
  }
};
