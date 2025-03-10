


// backend/routes/marketplaceRoutes.js
const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/marketplace - List an item (requires authentication)
router.post("/", protect, marketplaceController.listItem);

// GET /api/marketplace - Retrieve all items (public)
router.get("/", marketplaceController.getItems);

// GET /api/marketplace/:id - Retrieve a single item by ID (public)
router.get("/:id", marketplaceController.getItemById);

module.exports = router;
