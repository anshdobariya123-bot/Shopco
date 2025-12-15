import express from "express";
import {
  getAllOrders,
  getOrderById,
  markShipped,
  markDelivered,
  cancelOrder,
} from "../controllers/adminOrderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   ADMIN ORDER ROUTES
=============================== */

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Admin
 */
router.get("/orders", protect, admin, getAllOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order details (admin)
 * @access  Admin
 */
router.get("/orders/:id", protect, admin, getOrderById);

/**
 * @route   PUT /api/admin/orders/:id/ship
 * @desc    Mark order as shipped
 * @access  Admin
 */
router.put("/orders/:id/ship", protect, admin, markShipped);

/**
 * @route   PUT /api/admin/orders/:id/deliver
 * @desc    Mark order as delivered
 * @access  Admin
 */
router.put("/orders/:id/deliver", protect, admin, markDelivered);

/**
 * @route   PUT /api/admin/orders/:id/cancel
 * @desc    Cancel order (admin)
 * @access  Admin
 */
router.put("/orders/:id/cancel", protect, admin, cancelOrder);

export default router;
