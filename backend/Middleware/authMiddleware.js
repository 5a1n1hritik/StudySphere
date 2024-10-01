const jwt = require("jsonwebtoken");
const User = require("../models/Users");

// Middleware to verify JWT token
const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({
      error: "Please authenticate using a valid token",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    // console.log("Decoded user:", req.user); // Consider commenting this out in production

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    return res.status(401).json({
      error: "Please authenticate using a valid token",
      message: "Invalid token",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    // Find the user in the database by ID
    const user = await User.findById(req.user.id).select("role"); // Only select the role field

    // If the user is not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's role is 'Admin'
    if (user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { fetchuser, isAdmin };
