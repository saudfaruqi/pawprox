// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET /api/admin/users - Get all users (admin only)
router.get('/users', protect, authorizeRoles('admin'), adminController.getUsers);

// POST /api/admin/approve-vendor - Approve a vendor (admin only)
router.post('/approve-vendor', protect, authorizeRoles('admin'), adminController.approveVendor);

module.exports = router;
