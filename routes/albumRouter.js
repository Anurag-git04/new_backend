const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createAlbum,
  getUserAlbum,
  getAlbumById,
  updateAlbum,
  getAlbumSharedByUser,
  getAlbumImageStat,
  deleteAlbum,
} = require("../controllers/albumController");
const {
  validateAlbumCreation,
  validateAlbumUpdate,
} = require("../middleware/validationMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", upload.single("image"), validateAlbumCreation, createAlbum);
router.get("/", getUserAlbum);
router.get("/stat/album-stat", getAlbumImageStat);
router.get("/:albumId", getAlbumById);
router.get("/album/shared", getAlbumSharedByUser);
router.put("/:albumId", updateAlbum);
router.delete("/:albumId", deleteAlbum);

module.exports = router;
