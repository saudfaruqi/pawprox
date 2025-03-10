const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/send', protect, friendController.sendRequest);
router.get('/check/:user_id', protect, friendController.checkFriendship);
router.get('/requests', protect, friendController.getRequests);
router.get('/accepted', protect, friendController.getAcceptedFriends);
router.post('/accept/:id', protect, friendController.acceptRequest);
router.delete('/:id', protect, friendController.deleteRequest);
// New route for removing a friend permanently
router.delete('/remove/:friend_id', protect, friendController.removeFriend);

module.exports = router;
