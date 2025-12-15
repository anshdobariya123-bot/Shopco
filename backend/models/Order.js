import mongoose from "mongoose";

/* ===============================
   ORDER ITEM SUB-SCHEMA
=============================== */
const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { _id: false }
);

/* ===============================
   SHIPPING ADDRESS SUB-SCHEMA
=============================== */
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

/* ===============================
   MAIN ORDER SCHEMA
=============================== */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🚀 Faster "My Orders"
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (v) => v.length > 0,
        "Order must contain at least one item",
      ],
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Stripe", "Razorpay", "PayPal"],
      default: "COD",
    },

    /* 💰 PRICING (SERVER-CONTROLLED) */
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    /* 💳 PAYMENT STATUS */
    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    /* 🚚 SHIPPING STATUS */
    isShipped: {
      type: Boolean,
      default: false,
    },

    shippedAt: Date,

    /* 📦 DELIVERY STATUS */
    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,

    /* ❌ CANCELLATION */
    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Order", orderSchema);
