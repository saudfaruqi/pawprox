// backend/routes/contactRoutes.js
const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const contactController = require("../controllers/contactController");

// 1) ensure the upload directory exists
const uploadDir = path.join(__dirname, "../uploads/contact-files");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2) configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Multer will write into an existing folder
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext    = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// 3) the POST route
router.post("/", upload.single("file"), contactController.handleContact);

module.exports = router;
