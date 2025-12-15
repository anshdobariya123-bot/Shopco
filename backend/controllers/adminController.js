import Product from "../models/Product.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";

/* ================= PRODUCT ================= */

// ✅ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countInStock,
      category,
      isNewArrival,
      isFeatured,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ AUTO-GENERATED SEARCH KEYWORDS
    const keywords = [
      ...name.toLowerCase().split(" "),
      ...(description ? description.toLowerCase().split(" ") : []),
      category,
    ]
      .map(w => w.replace(/[^a-z0-9]/gi, ""))
      .filter(Boolean);

    const images = (req.files || []).map((f) =>
      f.path.replace(/\\/g, "/")
    );

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price,
      countInStock,
      category,
      images,
      keywords: [...new Set(keywords)], // ✅ IMPORTANT
      isNewArrival,
      isFeatured,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL PRODUCTS (ADMIN)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE PRODUCT (FOR EDIT)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE PRODUCT (EDIT + IMAGE REMOVE)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      countInStock,
      category,
      isNewArrival,
      isFeatured,
      imagesToRemove, // ✅ FROM FRONTEND
    } = req.body;

    // ✅ Update text fields
    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true });
    }

    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.countInStock = countInStock ?? product.countInStock;
    product.category = category ?? product.category;
    product.isNewArrival = isNewArrival ?? product.isNewArrival;
    product.isFeatured = isFeatured ?? product.isFeatured;

    // ✅ REMOVE EXISTING IMAGES
    if (imagesToRemove) {
      const removeList = JSON.parse(imagesToRemove);

      product.images = product.images.filter(
        (img) => !removeList.includes(img)
      );

      removeList.forEach((img) => {
        const fullPath = path.resolve(img);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // ✅ ADD NEW IMAGES
    if (req.files?.length) {
      const newImages = req.files.map((f) =>
        f.path.replace(/\\/g, "/")
      );
      product.images.push(...newImages);
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.images.forEach((img) => {
      const fullPath = path.resolve(img);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
