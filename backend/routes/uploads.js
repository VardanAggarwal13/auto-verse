const express = require("express");
const multer = require("multer");
const { Readable } = require("stream");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { auth, checkRole } = require("../middleware/auth");
const { cloudinary, isCloudinaryConfigured } = require("../utils/cloudinary");

const router = express.Router();

const MAX_FILES = 6;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB each
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
    }
    cb(null, true);
  },
});

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    Readable.from([buffer]).pipe(stream);
  });

const extForMime = (mime) => {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
};

const saveBufferLocally = async (file) => {
  const baseDir = path.join(__dirname, "..", "uploads", "vehicles");
  await fs.mkdir(baseDir, { recursive: true });
  const ext = extForMime(file.mimetype) || path.extname(file.originalname) || "";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const full = path.join(baseDir, name);
  await fs.writeFile(full, file.buffer);
  return `/uploads/vehicles/${name}`;
};

// @route   POST /api/uploads/images
// @desc    Upload one or more images and get back hosted URLs
// @access  Private (Dealer, Admin)
router.post("/images", [auth, checkRole(["dealer", "admin"]), upload.array("images", MAX_FILES)], async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Prefer Cloudinary if configured, otherwise store locally under backend/uploads
    // and serve from /uploads via express.static.
    if (isCloudinaryConfigured()) {
      const folder = (process.env.CLOUDINARY_FOLDER || "autoverse/vehicles").trim();
      const uploads = await Promise.all(
        files.map((f) =>
          uploadBufferToCloudinary(f.buffer, {
            folder,
            resource_type: "image",
            overwrite: false,
          }),
        ),
      );

      const urls = uploads.map((u) => u.secure_url || u.url).filter(Boolean);
      return res.status(201).json({ urls });
    }

    const baseUrl = (process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const relPaths = await Promise.all(files.map(saveBufferLocally));
    const urls = relPaths.map((p) => `${baseUrl}${p}`);
    return res.status(201).json({ urls });
  } catch (err) {
    const msg = typeof err?.message === "string" ? err.message : "Upload failed";
    res.status(500).json({ message: msg });
  }
});

module.exports = router;
