const express        = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');  // ensure path is correct
const { protect }    = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup',          authController.signup);
router.post('/login',           authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);
router.post('/upgrade',         protect, authController.upgradeToVendor);

// ✅ use the renamed export here:
router.get('/profile', protect, userController.getUserProfile);

module.exports = router;
