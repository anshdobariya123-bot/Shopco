import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, unique: true, index: true },

    description: String,

    price: { type: Number, required: true },

    category: {
      type: String,
      enum: ["men", "women", "electronics", "shoes"],
      required: true,
    },

    images: [String],

    countInStock: { type: Number, default: 0 },

    keywords: [String], // ✅ good for manual boosting

    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ✅ TEXT SEARCH INDEX */
productSchema.index({
  name: "text",
  description: "text",
  keywords: "text",
});

export default mongoose.model("Product", productSchema);
