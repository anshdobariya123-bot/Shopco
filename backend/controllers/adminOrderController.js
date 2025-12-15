import Order from "../models/Order.js";
import asyncHandler from "../middleware/asyncHandler.js";

/* ===============================
   ADMIN ORDERS
=============================== */

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json(order);
});

export const markShipped = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isCancelled) {
    res.status(400);
    throw new Error("Cancelled order cannot be shipped");
  }

  if (order.isShipped) {
    res.status(400);
    throw new Error("Order already shipped");
  }

  order.isShipped = true;
  order.shippedAt = Date.now();

  await order.save();
  res.json(order);
});

export const markDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.isShipped) {
    res.status(400);
    throw new Error("Order must be shipped first");
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error("Order already delivered");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();
  res.json(order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error("Delivered order cannot be cancelled");
  }

  if (order.isCancelled) {
    res.status(400);
    throw new Error("Order already cancelled");
  }

  order.isCancelled = true;
  order.cancelledAt = Date.now();

  await order.save();
  res.json(order);
});
