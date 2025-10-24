const { default: axios } = require("axios");
const { oauth2client } = require("../utils/googleConfig");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code not found",
      });
    }

    const googleResponse = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleResponse.tokens);

    const userResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
    );

    const { email, name, picture } = userResponse.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        profilePicture: picture,
      });
    }

    console.log("User secret key", process.env.JWT_SECRET);

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", // 1 hour
      }
    );

    console.log(token);

    res.status(200).json({
      success: true,
      message: user ? "Login successful" : "User created and logged in",
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        image: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate user",
      error: error.message,
    });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      message: "User info fetched successfully",
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
      error: error.message,
    });
  }
};

module.exports = { googleLogin, getUserInfo };
