import Product from "../models/Product.js";

/* ✅ LIST PRODUCTS */
export const listProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(products);
};

/* ✅ SEARCH PRODUCTS */
export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) return res.json([]);

    const words = q
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .split(" ")
      .filter(Boolean);

    const filter = {
      $and: words.map((word) => ({
        $or: [
          { name: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
        ],
      })),
    };

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✅ SINGLE PRODUCT */
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};


/* ✅ CATEGORY (FIXED & OPTIMIZED) */
export const listProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category?.toLowerCase().trim();

    // ✅ Validate category
    const allowedCategories = ["men", "women", "electronics", "shoes", "kids"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    // ✅ Case-insensitive & safe query
    const products = await Product.find({
      category: { $regex: `^${category}$`, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};


/* ✅ NEW ARRIVALS */
export const listNewArrivals = async (req, res) => {
  const products = await Product.find({ isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(8);

  res.json(products);
};
