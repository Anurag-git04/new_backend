import Album from("../models/Album");
import Image from("../models/Image");
import { v4 as uuidv4 } from ("uuid");
import cloudinary from ("cloudinary").v2;

const uploadImage = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
      });
    }

    // Verify if the user has access to the album

    console.log("Cloudinary Upload:", req.file);

    const album = await Album.findOne({ albumId });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const hasAccess =
      album.owner === userId || album.sharedWith.includes(userEmail);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this album",
      });
    }

    const { tags, name, description } = req.body;
    console.log("Tags:", tags);
    // Parse tags safely
    let parsedTags = [];
    try {
      if (typeof tags === "string") {
        parsedTags = JSON.parse(tags);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    } catch (err) {
      console.warn("Error parsing tags:", err);
    }

    console.log("parsedTags:", parsedTags);

    const newImage = await Image.create({
      imageId: uuidv4(),
      albumId,
      name,
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      tags: parsedTags,
      description,
      isFavorite: false,
      uploadedBy: userId,
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      image: {
        imageId: newImage.imageId,
        albumId: newImage.albumId,
        name: newImage.name,
        imageUrl: newImage.imageUrl,
        tags: newImage.tags,
        isFavorite: newImage.isFavorite,
        uploadedAt: newImage.uploadedAt,
        uploadedBy: newImage.uploadedBy,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

const getAlbumImages = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    const album = await Album.findOne({ albumId });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const hasAccess =
      album.owner === userId ||
      album.sharedWith.some((id) => id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this album",
      });
    }
    const images = await Image.find({ albumId })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments.userId",
        select: "name profilePicture",
      });

    console.log(images);

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    console.log("Error getting album images:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetching album images",
      error: error.message,
    });
  }
};

// Get favorite images in an album
const getFavoriteImages = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Verify album exists and user has access
    const album = await Album.findOne({ albumId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }
    console.log("user Id:", userId);
    // Check if user has access to album
    console.log("shRED wITH:", album.sharedWith);
    const hasAccess =
      album.owner === userId ||
      album.sharedWith.some((id) => id.toString() === userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this album",
      });
    }

    const favoriteImages = await Image.find({
      albumId,
      isFavorite: true,
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      images: favoriteImages.map((image) => ({
        imageId: image.imageId,
        albumId: image.albumId,
        name: image.name,
        filename: image.filename,
        cloudinaryUrl: image.cloudinaryUrl,
        size: image.size,
        mimeType: image.mimeType,
        tags: image.tags,
        person: image.person,
        isFavorite: image.isFavorite,
        comments: image.comments,
        uploadedAt: image.uploadedAt,
        updatedAt: image.updatedAt,
        uploadedBy: image.uploadedBy,
      })),
    });
  } catch (error) {
    console.error("Get favorite images error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching favorite images",
      error: error.message,
    });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { albumId, imageId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Verify album exists and user has access
    const album = await Album.findOne({ albumId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Check if user has access to album
    // const hasAccess =
    //   album.owner === userId || album.sharedWith.includes(userEmail);
    // if (!hasAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied to this album",
    //   });
    // }

    const image = await Image.findOne({ imageId });
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    image.isFavorite = !image.isFavorite;
    await image.save();

    res.json({
      success: true,
      message: `Image ${
        image.isFavorite ? "added to" : "removed from"
      } favorites`,
      isFavorite: image.isFavorite,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling favorite status",
      error: error.message,
    });
  }
};

// Add Comment to image
const addComment = async (req, res) => {
  try {
    const { albumId, imageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!text || text.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    // Verify album exists and user has access
    const album = await Album.findOne({ albumId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const image = await Image.findOne({ imageId });
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const newComment = {
      commentId: uuidv4(),
      userId: userId,
      text: text.trim(),
    };

    image.comments.push(newComment);
    await image.save();

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { albumId, imageId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    console.log("AlbumId :", albumId);
    console.log("ImageId :", imageId);

    // Verify album exists and user has access
    const image = await Image.findOne({ imageId, albumId });
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    //Delete image from cloudinary
    // await cloudinary.v2.uploader.destroy(image.cloudinaryPublicId);
    await cloudinary.uploader.destroy(image.cloudinaryPublicId);

    // Delete image from database
    await Image.deleteOne({ imageId });

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  getAlbumImages,
  getFavoriteImages,
  toggleFavorite,
  addComment,
  deleteImage,
};
