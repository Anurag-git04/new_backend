import express from("express");
import authenticateToken from("../middleware/authMiddleware");
import {
  createAlbum,
  getUserAlbum,
  getAlbumById,
  updateAlbum,
  getAlbumSharedByUser,
  getAlbumImageStat,
  deleteAlbum,
} from("../controllers/albumController");
import {
  validateAlbumCreation,
  validateAlbumUpdate,
} from("../middleware/validationMiddleware");
import upload from("../middleware/uploadMiddleware");

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
