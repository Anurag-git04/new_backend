import Album from "../models/Album"
import { v4 as uuidv4 } from "uuid"
import Image from"../models/Image"
import cloudinary from ("cloudinary").v2;

const createAlbum = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Album name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
      });
    }

    console.log("Cloudinary Upload:", req.file);

    const existingAlbum = await Album.findOne({
      name: name.trim(),
      owner: userId,
    });

    if (existingAlbum) {
      return res.status(409).json({
        success: false,
        message: "Album already exists",
      });
    }

    const newAlbum = await Album.create({
      albumId: uuidv4(),
      name: name.trim(),
      description: description?.trim(),
      albumPic: req.file.path,
      owner: userId,
      sharedWith: [],
    });

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      album: {
        albumId: newAlbum.albumId,
        name: newAlbum.name,
        description: newAlbum.description,
        owner: newAlbum.owner,
        albumPic: newAlbum.albumPic,
        sharedWith: newAlbum.sharedWith,
        createdAt: newAlbum.createdAt,
        updatedAt: newAlbum.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create album",
      error: error.message,
    });
  }
};

//Get Album Stats

const getAlbumImageStat = async (req, res) => {
  try {
    const userId = req.user.userId;

    const albums = await Album.find({ owner: userId });

    const stats = await Promise.all(
      albums.map(async (album) => {
        const count = await Image.countDocuments({ albumId: album.albumId });
        return {
          albumName: album.name,
          imageCount: count,
        };
      })
    );
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching album stats:", error); // 🧠 Add this line
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message,
    });
  }
};

const getUserAlbum = async (req, res) => {
  try {
    const userId = req.user.userId;
    const albums = await Album.find({ owner: userId });

    res.json({
      success: true,
      albums,
    });
  } catch (error) {
    console.error("Get user album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user album",
      error: error.message,
    });
  }
};

const getAlbumById = async (req, res) => {
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
      album.owner === userId || album.sharedWith.includes(userEmail);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this album",
      });
    }

    res.json({
      success: true,
      album: {
        albumId: album.albumId,
        name: album.name,
        description: album.description,
        owner: album.owner,
        sharedWith: album.sharedWith,
        isOwner: album.isOwner,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get album by id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get album",
      error: error.message,
    });
  }
};

// Get album shared by userId
const getAlbumSharedByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Req", req.user);
    // const email = req.user.email;

    console.log(userId);

    const albums = await Album.find({ sharedWith: { $in: [userId] } }).sort({
      createdAt: -1,
    });
    console.log("Albums:", albums);

    res.json({
      success: true,
      albums: albums.map((album) => ({
        albumId: album.albumId,
        name: album.name,
        description: album.description,
        owner: album.owner,
        albumPic: album.albumPic,
        isOwner: album.owner === userId,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get album shared by user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get album shared by user",
      error: error.message,
    });
  }
};

// Update album (Only owner can update)
const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { description, sharedWith } = req.body;
    const userId = req.user.userId;

    const album = await Album.findOne({ albumId });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    if (album.owner !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this album",
      });
    }

    let parseSharedWith = [];
    try {
      if (typeof sharedWith === "string") {
        parseSharedWith = JSON.parse(sharedWith);
      } else if (Array.isArray(sharedWith)) {
        parseSharedWith = sharedWith;
      }
    } catch (error) {
      console.log("Error parsing sharedWith:", error);
    }

    if (description) {
      album.description = description?.trim();
    }

    album.sharedWith = parseSharedWith;
    await album.save();

    console.log("Updated Album : ", album);

    res.json({
      success: true,
      message: "Album updated successfully",
      album: album,
    });
  } catch (error) {
    console.error("Update album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update album",
      error: error.message,
    });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.userId;

    const album = await Album.findOne({ albumId });

    if (!album) {
      return res
        .status(404)
        .json({ success: false, message: "Album not found" });
    }

    const hasAccess = album.owner === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this album",
      });
    }

    const images = await Image.find({ albumId });
    for (const img of images) {
      try {
        const publicId = img.cloudinaryPublicId;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Cloudinary delete error:", err.message);
      }
    }

    await Album.deleteOne({ albumId });

    res
      .status(200)
      .json({ success: true, message: "Album Deleted Successfully" });
  } catch (error) {}
};

module.exports = {
  createAlbum,
  getUserAlbum,
  getAlbumById,
  getAlbumSharedByUser,
  updateAlbum,
  getAlbumImageStat,
  deleteAlbum,
};
