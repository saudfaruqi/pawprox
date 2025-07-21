const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require('../middlewares/authMiddleware');

// GET reviews for a product (public)
router.get("/", reviewController.getProductReviews);

// GET user's review for a specific product (protected)
router.get("/user/:productId", protect, reviewController.getUserReview);

// POST review (protected route)
router.post("/", protect, reviewController.createReview);

// PUT update review (protected route)
router.put("/:reviewId", protect, reviewController.updateReview);

// DELETE review (protected route)
router.delete("/:reviewId", protect, reviewController.deleteReview);

module.exports = router;