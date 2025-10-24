const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  folder: "kaviospix",
  allowedFormats: ["jpg", "jpeg", "png"],
  maxFileSize: 1024 * 1024 * 5,
  metadata: function (req, file, cb) {
    cb(null, {
      albumId: req.params.albumId,
    });
  },
});

const upload = multer({ storage });

module.exports = upload;
