const db = require("../config/db");

// Helper function to recalculate and update product rating
const updateProductRating = async (productId) => {
  try {
    const [avgRows] = await db.query(
      "SELECT AVG(rating) AS avgRating FROM product_reviews WHERE product_id = ?",
      [productId]
    );
    
    if (avgRows && avgRows.length > 0) {
      const avgRating = avgRows[0].avgRating ? Math.round(avgRows[0].avgRating) : 0;
      await db.query(
        "UPDATE marketplace SET rating = ? WHERE id = ?",
        [avgRating, productId]
      );
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// Create a review (protected route)
exports.createReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;
  
  console.log("Creating review:", { userId, productId, rating, comment });
  
  if (!productId || !rating) {
    return res.status(400).json({ error: "Product ID and rating are required." });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }
  
  try {
    // Check if user already has a review for this product
    const [existingReview] = await db.query(
      "SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?",
      [productId, userId]
    );
    
    if (existingReview.length > 0) {
      return res.status(400).json({ error: "You have already reviewed this product. Please edit your existing review instead." });
    }
    
    // Insert the new review
    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [productId, userId, rating, comment || null]
    );
    
    const reviewId = result.insertId;
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(201).json({ 
      reviewId, 
      message: "Review added successfully.",
      review: {
        id: reviewId,
        product_id: productId,
        user_id: userId,
        rating,
        comment: comment || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Server error while creating review" });
  }
};

// Get reviews for a product (public)
exports.getProductReviews = async (req, res) => {
  const { productId } = req.query;
  
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }
  
  try {
    const [reviews] = await db.query(
      `SELECT pr.*, u.name AS username, u.profilePic 
       FROM product_reviews pr 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.product_id = ? 
       ORDER BY pr.created_at DESC`,
      [productId]
    );
    
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Server error while fetching reviews" });
  }
};

// Get user's review for a specific product (protected)
exports.getUserReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const userId = req.user.id;
  const { productId } = req.params;
  
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }
  
  try {
    const [reviews] = await db.query(
      `SELECT pr.*, u.name AS username, u.profilePic 
       FROM product_reviews pr 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.product_id = ? AND pr.user_id = ?`,
      [productId, userId]
    );
    
    if (reviews.length === 0) {
      return res.status(404).json({ error: "No review found for this user and product." });
    }
    
    res.status(200).json({ review: reviews[0] });
  } catch (error) {
    console.error("Error fetching user review:", error);
    res.status(500).json({ error: "Server error while fetching user review" });
  }
};

// Update a review (protected)
exports.updateReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const userId = req.user.id;
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  
  console.log("Updating review:", { userId, reviewId, rating, comment });
  
  if (!reviewId) {
    return res.status(400).json({ error: "Review ID is required." });
  }
  
  if (!rating) {
    return res.status(400).json({ error: "Rating is required." });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }
  
  try {
    // Check if the review exists and belongs to the user
    const [existingReview] = await db.query(
      "SELECT id, product_id FROM product_reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );
    
    if (existingReview.length === 0) {
      return res.status(404).json({ error: "Review not found or you don't have permission to update it." });
    }
    
    const productId = existingReview[0].product_id;
    
    // Update the review
    const [result] = await db.query(
      "UPDATE product_reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [rating, comment || null, reviewId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found or you don't have permission to update it." });
    }
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(200).json({ 
      message: "Review updated successfully.",
      reviewId: parseInt(reviewId)
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Server error while updating review" });
  }
};

// Delete a review (protected)
exports.deleteReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const userId = req.user.id;
  const { reviewId } = req.params;
  
  console.log("Deleting review:", { userId, reviewId });
  
  if (!reviewId) {
    return res.status(400).json({ error: "Review ID is required." });
  }
  
  try {
    // Check if the review exists and belongs to the user
    const [existingReview] = await db.query(
      "SELECT id, product_id FROM product_reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );
    
    if (existingReview.length === 0) {
      return res.status(404).json({ error: "Review not found or you don't have permission to delete it." });
    }
    
    const productId = existingReview[0].product_id;
    
    // Delete the review
    const [result] = await db.query(
      "DELETE FROM product_reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found or you don't have permission to delete it." });
    }
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(200).json({ 
      message: "Review deleted successfully.",
      reviewId: parseInt(reviewId)
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Server error while deleting review" });
  }
};