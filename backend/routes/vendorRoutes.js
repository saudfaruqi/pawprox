const express = require("express");
const router = express.Router();
const { getVendorProfile, becomeVendor, updateVendorProfile } = require("../controllers/vendorController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/profile", protect, getVendorProfile);
router.post("/become", protect, becomeVendor);
router.put("/profile/edit", protect, updateVendorProfile); // New route for editing

module.exports = router;
