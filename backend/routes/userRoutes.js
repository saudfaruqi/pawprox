

// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get user profile
router.get('/profile', protect, userController.getUserProfile);
// Update user profile (with optional profilePic)
router.put('/profile', protect, upload.single('profilePic'), userController.updateUserProfile);
// Update user password (Security tab)
router.put('/password', protect, userController.updateUserPassword);
// Update user preferences (Preferences tab)
router.put('/preferences', protect, userController.updateUserPreferences);

router.delete('/', protect, userController.deleteAccount);

// Get users by search
router.get('/', protect, userController.getUsers);

module.exports = router;
