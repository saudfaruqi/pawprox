// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Middleware to protect routes by verifying JWT tokens.
 */
exports.protect = (req, res, next) => {
  let token;
  
  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token) {
    console.error("No token provided in request headers");
    return res.status(401).json({ error: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded); // Debug log
    
    // Check if decoded token has the expected structure
    if (!decoded.id && !decoded.userId && !decoded.user_id) {
      console.error("Token does not contain user ID");
      return res.status(401).json({ error: "Not authorized, invalid token structure" });
    }
    
    // Set user details on request object
    // Handle different possible property names for user ID
    req.user = { 
      id: decoded.id || decoded.userId || decoded.user_id,
      role: decoded.role || 'user',
      email: decoded.email // Include email if available
    };
    
    console.log("Set req.user:", req.user); // Debug log
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).json({ error: "Not authorized, token invalid" });
  }
};