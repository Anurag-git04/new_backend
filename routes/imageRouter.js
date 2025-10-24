const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { getAlbumById } = require("../controllers/albumController");
const upload = require("../middleware/uploadMiddleware");
const {
  getAlbumImages,
  uploadImage,
  getFavoriteImages,
  toggleFavorite,
  addComment,
  deleteImage,
} = require("../controllers/imageController");

router.use(authenticateToken);

// Image upload
router.post("/:albumId/images", upload.single("image"), uploadImage);

// Get images in album
router.get("/:albumId/images", getAlbumImages);

// Get favorite images in album
// router.get("/:albumId/images/favorite", getFavoriteImages);

// Toggle favorite status
router.put("/:albumId/images/:imageId/favorite", toggleFavorite);

// Add Comment to image
router.post("/:albumId/images/:imageId/comments", addComment);

// Delete image
router.delete("/:albumId/images/:imageId", deleteImage);

module.exports = router;
