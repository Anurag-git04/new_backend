const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
const { v4: uuidv4 } = await import('uuid');
const User = require("./User");

const albumSchema = new mongoose.Schema(
  {
    albumId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: String, // userId string instead of ObjectId
      required: true,
      ref: "User",
    },
    albumPic: {
      type: String,
      required: true,
    },
    sharedWith: [
      {
        type: String, // Array of email strings
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Virtual field for image count (will be implemented later)
albumSchema.virtual("imageCount", {
  ref: "Image",
  localField: "albumId",
  foreignField: "albumId",
  count: true,
});

module.exports = mongoose.model("Album", albumSchema);
