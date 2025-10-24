import Album from ("../models/Album");

const validateAlbumCreation = async (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Album name is required",
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Album name must be less than 100 characters",
    });
  }

  const existingAlbum = await Album.findOne({
    name: name.trim(),
  });

  if (existingAlbum) {
    return res.status(409).json({
      success: false,
      message: "Album already exists",
    });
  }

  next();
};

const validateAlbumUpdate = async (req, res, next) => {
  const { description } = req.body;

  if (description && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "Description must be a string",
    });
  }

  if (description && description.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: "Description must be less than 500 characters",
    });
  }

  next();
};

module.exports = { validateAlbumCreation, validateAlbumUpdate };
