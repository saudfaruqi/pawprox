


// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/signup - Create a new user
router.post('/signup', authController.signup);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// POST /api/auth/upgrade - Upgrade a user to vendor (protected)
router.post('/upgrade', protect, authController.upgradeToVendor);

module.exports = router;
