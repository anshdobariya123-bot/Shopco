import express from "express";
import {
  placeOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   USER ORDER ROUTES
=============================== */

/**
 * @route   POST /api/orders
 * @desc    Place new order
 * @access  Private
 */
router.post("/", protect, placeOrder);

/**
 * @route   GET /api/orders/my
 * @desc    Get logged-in user's orders
 * @access  Private
 */
router.get("/my", protect, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID (owner or admin)
 * @access  Private
 */
router.get("/:id", protect, getOrderById);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order (owner or admin)
 * @access  Private
 */
router.put("/:id/cancel", protect, cancelOrder);

export default router;
