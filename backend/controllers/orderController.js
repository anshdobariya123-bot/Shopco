import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/* ===============================
   PLACE ORDER
=============================== */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    /* 🔐 RE-CALCULATE PRICES (SECURITY) */
    let itemsPrice = 0;

    for (const item of orderItems) {
  if (!mongoose.Types.ObjectId.isValid(item.product)) {
    return res.status(400).json({
      message: `Invalid product ID in cart`,
    });
  }

  const product = await Product.findById(item.product);

  if (!product) {
    return res.status(404).json({
      message: `Product not found`,
    });
  }

  if (product.countInStock < item.qty) {
    return res.status(400).json({
      message: `${product.name} is out of stock`,
    });
  }

  itemsPrice += product.price * item.qty;
}


    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    /* 📉 REDUCE STOCK */
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

/* ===============================
   GET ORDER BY ID
=============================== */
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownerId = order.user._id.toString();
    const requesterId = req.user._id.toString();

    if (ownerId !== requesterId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ===============================
   MY ORDERS
=============================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ===============================
   CANCEL ORDER
=============================== */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isDelivered) {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled",
      });
    }

    if (order.isCancelled) {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    order.isCancelled = true;
    order.cancelledAt = Date.now();

    await order.save();

    res.json(order);
  } catch {
    res.status(500).json({ message: "Cancellation failed" });
  }
};

/* ===============================
   ADMIN – GET ALL ORDERS
=============================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ===============================
   ADMIN – MARK DELIVERED
=============================== */
export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isCancelled) {
      return res.status(400).json({
        message: "Cancelled order cannot be delivered",
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    await order.save();

    res.json(order);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};
