const { verifyToken } = require("../utils/jwtUtils");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }
    // console.log("middleware", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded", decoded);
    const user = await User.findOne({ userId: decoded.userId });
    // console.log(user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error("Authentication error:", error);
    res.status(403).json({
      success: false,
      message: "Failed to authenticate user",
      error: error.message,
    });
  }
};

module.exports = authenticateToken;
