const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header("Authorization");
  
  // If no token is provided, send a 401 Unauthorized response
  if (!token) return res.status(401).json({ message: "Немає доступу" });

  try {
    // Verify the token by removing "Bearer " prefix from the token
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    // Attach user data to the request object
    req.user = verified; // You now have access to req.user in your routes
    next();  // Move to the next middleware or route handler
  } catch (err) {
    // If the token is invalid or expired
    res.status(401).json({ message: "Невірний токен" });
  }
};

// Admin Middleware to ensure the user is an admin
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();  // Proceed to the next middleware or route handler
};

module.exports = { authMiddleware, adminMiddleware };
