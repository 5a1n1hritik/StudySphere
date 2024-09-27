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
