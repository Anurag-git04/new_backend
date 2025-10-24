const express = require("express");
const { googleLogin } = require("../controllers/authController");
const User = require("../models/User");
const router = express.Router();

router.get("/google", googleLogin);
router.get("/allUser", async (req, res) => {
  try {
    const user = await User.find({}, "name userId");
    console.log(user);

    res.json({
      success: true,
      users: user,
    });
  } catch (error) {
    console.log("error while fetching");
    res.status(404).json({ message: `error while fetching user`, error });
  }
});

module.exports = router;
