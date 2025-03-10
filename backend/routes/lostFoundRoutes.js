const express = require("express");
const router = express.Router();
const { getLostPets, createLostPet, updateLostPet, deleteLostPet } = require("../controllers/lostFoundController");

const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET lost pet alerts
router.get("/", getLostPets);

// POST new lost pet alert (with file upload support)
router.post("/", upload.single("image"), createLostPet);

// PUT update lost pet alert (with file upload support)
// If no new file is uploaded, client should include an "existingImage" field.
router.put("/:id", upload.single("image"), updateLostPet);

// DELETE lost pet alert
router.delete("/:id", deleteLostPet);

module.exports = router;
