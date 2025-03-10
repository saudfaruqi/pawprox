const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image!'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.get('/', postController.getPosts);
router.post('/', protect, upload.single('image'), postController.createPost);
router.post('/:id/react', protect, postController.addReaction);
router.post('/:id/comment', protect, postController.addComment);
router.post('/:id/comments/:commentId/reply', protect, postController.addReply);
router.put('/:id', protect, postController.editPost);
router.delete('/:id', protect, postController.deletePost);

// New endpoints for editing and deleting comments
router.put('/:postId/comments/:commentId', protect, postController.editComment);
router.delete('/:postId/comments/:commentId', protect, postController.deleteComment);

module.exports = router;
