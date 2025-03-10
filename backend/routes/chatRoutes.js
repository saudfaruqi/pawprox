const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/conversation', protect, chatController.getConversation);
router.delete('/delete', protect, chatController.deleteConversation);

module.exports = router;
