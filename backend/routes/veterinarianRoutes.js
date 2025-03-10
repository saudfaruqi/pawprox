// backend/routes/veterinarianRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllVeterinarians,
  getVeterinarianById,
  createVeterinarian,
  updateVeterinarian,
  deleteVeterinarian
} = require("../controllers/veterinarianController");

// Public endpoints for retrieving veterinarians
router.get("/", getAllVeterinarians);
router.get("/:id", getVeterinarianById);

// Endpoints for creation, update, deletion (protect if needed)
router.post("/", createVeterinarian);
router.put("/:id", updateVeterinarian);
router.delete("/:id", deleteVeterinarian);

module.exports = router;
