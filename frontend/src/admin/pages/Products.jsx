import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

/* ===============================
   CONFIG
=============================== */
const IMAGE_BASE =
  import.meta.env.VITE_IMAGE_BASE_URL ;

const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  /* ===============================
     FETCH PRODUCTS
  =============================== */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/admin/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ===============================
     DELETE PRODUCT
  =============================== */
  const deleteHandler = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to permanently delete this product?"
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ===============================
     SEARCH FILTER
  =============================== */
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="p-6 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Products</h2>

        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category..."
            disabled={loading}
            className="w-full md:w-64 border px-4 py-2 rounded-lg 
                       outline-none focus:ring-2 focus:ring-indigo-500
                       disabled:bg-gray-100"
          />

          <Link
            to="/admin/products/add"
            className="bg-indigo-600 hover:bg-indigo-700 
                       text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 py-10 text-center">
          Loading products…
        </p>
      )}

      {/* EMPTY */}
      {!loading && filteredProducts.length === 0 && (
        <p className="text-center py-10 text-gray-500">
          No products found
        </p>
      )}

      {/* TABLE */}
      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const isDeleting = deletingId === product._id;

                return (
                  <tr
                    key={product._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* PRODUCT */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        className="w-12 h-12 object-cover rounded-lg border bg-white"
                        alt={product.name}
                      />

                      <div>
                        <p className="font-semibold">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {product._id.slice(-6)}
                        </p>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4 capitalize">
                      <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                        {product.category}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-4 font-medium">
                      ₹{product.price.toLocaleString()}
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            product.countInStock === 0
                              ? "bg-red-100 text-red-700"
                              : product.countInStock <= 5
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {product.countInStock === 0
                          ? "Out of stock"
                          : `${product.countInStock} in stock`}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-center space-x-2">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="inline-block px-3 py-1 text-sm
                                   bg-blue-50 text-blue-600 rounded-lg
                                   hover:bg-blue-100"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteHandler(product._id)}
                        disabled={isDeleting}
                        aria-busy={isDeleting}
                        className={`inline-block px-3 py-1 text-sm rounded-lg
                          ${
                            isDeleting
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
