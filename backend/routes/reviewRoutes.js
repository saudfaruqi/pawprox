

const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require('../middlewares/authMiddleware');

// GET reviews (this can be public if you wish)
router.get("/", reviewController.getProductReviews);

// POST review (protected route)
router.post("/", protect, reviewController.createReview);

module.exports = router;
