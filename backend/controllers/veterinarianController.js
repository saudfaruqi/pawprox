// backend/controllers/veterinarianController.js
const veterinarianModel = require("../models/veterinarianModel");

/**
 * GET /api/veterinarians
 * Retrieve all veterinarians.
 */
exports.getAllVeterinarians = async (req, res) => {
  try {
    const vets = await veterinarianModel.getAllVeterinarians();
    return res.status(200).json({ items: vets });
  } catch (error) {
    console.error("Error fetching veterinarians:", error);
    return res.status(500).json({ error: "Server error while fetching veterinarians" });
  }
};

/**
 * GET /api/veterinarians/:id
 * Retrieve a specific veterinarian by ID.
 */
exports.getVeterinarianById = async (req, res) => {
  const { id } = req.params;
  try {
    const vet = await veterinarianModel.getVeterinarianById(id);
    if (!vet) return res.status(404).json({ error: "Veterinarian not found" });
    return res.status(200).json({ vet });
  } catch (error) {
    console.error("Error fetching veterinarian:", error);
    return res.status(500).json({ error: "Server error while fetching veterinarian" });
  }
};

/**
 * POST /api/veterinarians
 * Create a new veterinarian.
 */
exports.createVeterinarian = async (req, res) => {
  const { name, specialty, experience, availability, location, rating, reviews, languages, certifications } = req.body;
  if (!name || !specialty || !experience || !availability || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const vetId = await veterinarianModel.createVeterinarian({
      name,
      specialty,
      experience,
      availability,
      location,
      rating,
      reviews,
      languages,
      certifications
    });
    return res.status(201).json({ message: "Veterinarian created successfully", vetId });
  } catch (error) {
    console.error("Error creating veterinarian:", error);
    return res.status(500).json({ error: "Server error while creating veterinarian" });
  }
};

/**
 * PUT /api/veterinarians/:id
 * Update an existing veterinarian.
 */
exports.updateVeterinarian = async (req, res) => {
  const { id } = req.params;
  const { name, specialty, experience, availability, location, rating, reviews, languages, certifications } = req.body;
  try {
    const affectedRows = await veterinarianModel.updateVeterinarian(id, {
      name,
      specialty,
      experience,
      availability,
      location,
      rating,
      reviews,
      languages,
      certifications
    });
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Veterinarian not found or no changes made" });
    }
    return res.status(200).json({ message: "Veterinarian updated successfully" });
  } catch (error) {
    console.error("Error updating veterinarian:", error);
    return res.status(500).json({ error: "Server error while updating veterinarian" });
  }
};

/**
 * DELETE /api/veterinarians/:id
 * Delete a veterinarian.
 */
exports.deleteVeterinarian = async (req, res) => {
  const { id } = req.params;
  try {
    const affectedRows = await veterinarianModel.deleteVeterinarian(id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Veterinarian not found" });
    }
    return res.status(200).json({ message: "Veterinarian deleted successfully" });
  } catch (error) {
    console.error("Error deleting veterinarian:", error);
    return res.status(500).json({ error: "Server error while deleting veterinarian" });
  }
};
