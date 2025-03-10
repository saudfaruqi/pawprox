


const lostPetModel = require("../models/lostFoundModel");

/**
 * GET /api/lost-found
 */
exports.getLostPets = async (req, res) => {
  try {
    const alerts = await lostPetModel.getLostPets();
    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching lost pet alerts:", error);
    return res.status(500).json({ error: "Server error while fetching lost pet alerts" });
  }
};

/**
 * POST /api/lost-found
 */
exports.createLostPet = async (req, res) => {
  const image = req.file ? req.file.path : null;
  // Extract user_id from the request body if available.
  // Otherwise, fallback to req.user.id (if authentication is in place).
  const { petName, species, description, location, status, contactInfo, lastSeen, user_id } = req.body;
  
  // Basic validation
  if (!petName || !species || !description || !location || !status || !contactInfo || !lastSeen) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    // Use the provided user_id or fallback to req.user.id.
    const finalUserId = user_id || (req.user ? req.user.id : null);
    const insertId = await lostPetModel.createLostPet({
      petName,
      species,
      description,
      location,
      status,
      contactInfo,
      lastSeen,
      image,
      user_id: finalUserId
    });
    const newAlert = { id: insertId, petName, species, description, location, status, contactInfo, lastSeen, image, user_id: finalUserId };
    return res.status(201).json(newAlert);
  } catch (error) {
    console.error("Error creating lost pet alert:", error);
    return res.status(500).json({ error: "Server error while creating lost pet alert" });
  }
};


/**
 * PUT /api/lost-found/:id
 */
exports.updateLostPet = async (req, res) => {
  const id = req.params.id;
  // Use the new file path if a file is uploaded; otherwise, check for existingImage in body.
  const image = req.file ? req.file.path : (req.body.existingImage || undefined);
  const { petName, species, description, location, status, contactInfo, lastSeen } = req.body;

  // Basic validation
  if (!petName || !species || !description || !location || !status || !contactInfo || !lastSeen) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const result = await lostPetModel.updateLostPet(id, { petName, species, description, location, status, contactInfo, lastSeen, image });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lost pet alert not found" });
    }
    // Fetch the updated alert to return it.
    const updatedAlert = await lostPetModel.getLostPetById(id);
    return res.status(200).json(updatedAlert);
  } catch (error) {
    console.error("Error updating lost pet alert:", error);
    return res.status(500).json({ error: "Server error while updating lost pet alert" });
  }
};

/**
 * DELETE /api/lost-found/:id
 */
exports.deleteLostPet = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await lostPetModel.deleteLostPet(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lost pet alert not found" });
    }
    return res.status(200).json({ message: "Lost pet alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting lost pet alert:", error);
    return res.status(500).json({ error: "Server error while deleting lost pet alert" });
  }
};
