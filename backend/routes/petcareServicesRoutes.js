// backend/routes/petcareServicesRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require("../controllers/petcareServicesController");

// Public endpoints for pet care services:
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// If needed, you can protect the creation/updating/deletion endpoints by adding your auth middleware.
// For now, they are left public:
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
