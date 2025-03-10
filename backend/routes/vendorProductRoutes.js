

//vendorproductroutes
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct
} = require("../controllers/vendorProductController");
const { protect } = require("../middlewares/authMiddleware");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
const upload = multer({ storage, fileFilter });

// Vendor products routes (protected)
// Accept one file for 'image' and up to 5 files for 'detail_images'
router.get("/", protect, getVendorProducts);
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "detail_images", maxCount: 5 }
  ]),
  createVendorProduct
);
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "detail_images", maxCount: 5 }
  ]),
  updateVendorProduct
);
router.delete("/:id", protect, deleteVendorProduct);

module.exports = router;
