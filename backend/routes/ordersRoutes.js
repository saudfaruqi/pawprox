

//ordersRoutes

const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

// Existing endpoints
router.post("/", protect, ordersController.createOrder);
router.get("/", protect, ordersController.getOrders);
router.get("/:id", protect, ordersController.getOrderById);
router.put("/:orderId/status", protect, ordersController.updateOrderStatus);

// New endpoints for re-order and invoice download
router.post("/:orderId/reorder", protect, ordersController.reorderOrder);
router.get("/:orderId/invoice", protect, ordersController.downloadInvoice);

router.put("/:orderId/tracking", protect, ordersController.updateTracking);
router.get("/:orderId/track", protect, ordersController.trackOrder);


module.exports = router;
