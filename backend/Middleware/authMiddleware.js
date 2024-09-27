// const jwt = require('jsonwebtoken');
// // const User = require('../models/Users');

// const protect = async (req, res, next) => {
//   let token;

//   // Check if the authorization header exists and starts with 'Bearer'
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Extract the token from the Authorization header
//       token = req.headers.authorization.split(' ')[1];

//       // Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Fetch the user from the database based on the token's payload (user id)
//       req.user = await User.findById(decoded.id).select('-password');

//       // Proceed to the next middleware or route handler
//       next();
//     } catch (error) {
//       console.error(error.message);
//       // Send a 401 Unauthorized response if token verification fails
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   // If no token is found in the request headers
//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = { protect };

// const jwt = require('jsonwebtoken');

// // Middleware to fetch user and verify JWT token
// const fetchuser = (req, res, next) => {
//   // Get token from 'auth-token' header or 'Authorization: Bearer <token>' format
//   const token = req.header('auth-token') || req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
//   }

//   try {
//     // Verify token using secret from environment variables
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded.user; // Attach user info to the request object
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
//     } else if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
//     } else {
//       console.error('Error verifying token:', error);
//       return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
//   }
// };

// module.exports = fetchuser;

var jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res
      .status(401)
      .send({
        error: "Please authenticate using a valid token",
        message: "Access denied. No token provided.",
      });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res
      .status(401)
      .send({
        error: "Please authenticate using a valid token",
        message: "Invalid token",
      });
  }
};

// Middleware to check if the user is an admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};


module.exports = {fetchuser, verifyAdmin };
