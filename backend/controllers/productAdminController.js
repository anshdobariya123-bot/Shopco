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

    const keywords = [
      ...name.toLowerCase().split(" "),
      ...(description ? description.toLowerCase().split(" ") : []),
      category.toLowerCase(),
    ]
      .map((w) => w.replace(/[^a-z0-9]/gi, ""))
      .filter(Boolean);

    const images = (req.files || []).map(
      (f) => `/${f.path.replace(/\\/g, "/")}`
    );

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price,
      countInStock,
      category,
      images,
      keywords: [...new Set(keywords)],
      isNewArrival,
      isFeatured,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// ✅ GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ message: "Product not found" });

  const {
    name,
    description,
    price,
    countInStock,
    category,
    isNewArrival,
    isFeatured,
    imagesToRemove,
  } = req.body;

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

  if (imagesToRemove) {
    const removeList = JSON.parse(imagesToRemove);
    product.images = product.images.filter(
      (img) => !removeList.includes(img)
    );

    removeList.forEach((img) => {
      const fullPath = path.resolve(img.slice(1));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });
  }

  if (req.files?.length) {
    const newImages = req.files.map(
      (f) => `/${f.path.replace(/\\/g, "/")}`
    );
    product.images.push(...newImages);
  }

  const updated = await product.save();
  res.json(updated);
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ message: "Product not found" });

  product.images.forEach((img) => {
    const fullPath = path.resolve(img.slice(1));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });

  await product.deleteOne();
  res.json({ message: "Product deleted" });
};
