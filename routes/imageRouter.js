import express from("express");
const router = express.Router();
import authenticateToken from("../middleware/authMiddleware");
import { getAlbumById }  from("../controllers/albumController");
import upload from("../middleware/uploadMiddleware");
import {
  getAlbumImages,
  uploadImage,
  getFavoriteImages,
  toggleFavorite,
  addComment,
  deleteImage,
} from("../controllers/imageController");

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
