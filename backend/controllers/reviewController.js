


// controllers/reviewController.js
const db = require("../config/db");

// Create a review (make sure this route is protected by auth middleware)
exports.createReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;
  
  if (!productId || !rating) {
    return res.status(400).json({ error: "Product ID and rating are required." });
  }
  
  try {
    // Insert the new review
    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [productId, userId, rating, comment]
    );
    const reviewId = result.insertId;
    
    // Recalculate average rating for the product
    const [avgRows] = await db.query(
      "SELECT AVG(rating) AS avgRating FROM product_reviews WHERE product_id = ?",
      [productId]
    );
    
    if (avgRows && avgRows.length > 0) {
      const avgRating = Math.round(avgRows[0].avgRating); // Rounded to the nearest integer
      // Update the product's average rating in the marketplace table.
      await db.query(
        "UPDATE marketplace SET rating = ? WHERE id = ?",
        [avgRating, productId]
      );
    }
    
    res.status(201).json({ reviewId, message: "Review added successfully." });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Server error while creating review" });
  }
};

// Get reviews for a product (adjusted for the correct column name)
exports.getProductReviews = async (req, res) => {
  const { productId } = req.query;
  
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }
  
  try {
    const [reviews] = await db.query(
      `SELECT pr.*, u.name AS username 
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
