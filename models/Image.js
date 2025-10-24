import mongoose from("mongoose");
// const { v4: uuidv4 } = require("uuid");
import { v4 as uuidv4 } from("uuid");

// Comment schema for embedded comments
const commentSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const imageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    albumId: {
      type: String,
      required: true,
      ref: "Album",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    comments: [commentSchema],
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: String,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

module.exports = mongoose.model("Image", imageSchema);
