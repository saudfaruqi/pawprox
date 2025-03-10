// routes/petRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const petController = require('../controllers/petController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer storage for pet photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create a new pet profile (with optional photo)
router.post('/', protect, upload.single('photo'), petController.createPetProfile);
// Get pet profiles for the authenticated user
router.get('/', protect, petController.getPetProfiles);
// Update a pet profile
router.put('/:petId', protect, upload.single('photo'), petController.updatePetProfile);
// Delete a pet profile
router.delete('/:petId', protect, petController.deletePetProfile);

module.exports = router;
