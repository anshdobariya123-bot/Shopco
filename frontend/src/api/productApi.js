import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// All products
export const getProducts = (page = 1) =>
  API.get(`/products?page=${page}`);

// New arrivals
export const getNewArrivals = () =>
  API.get("/products/new-arrivals");

// Products by category
export const getProductsByCategory = (categoryId) =>
  API.get(`/products/category/${categoryId}`);

// Single product
export const getProductById = (id) =>
  API.get(`/products/${id}`);
