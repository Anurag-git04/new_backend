const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
const { v4: uuidv4 } = await import("uuid");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profilePicture: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
