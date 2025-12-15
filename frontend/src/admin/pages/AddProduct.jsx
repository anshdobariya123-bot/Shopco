import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AddProduct() {
  const navigate = useNavigate();

  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= CLEAN OBJECT URLS ================= */
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  /* ================= IMAGE HANDLER ================= */
  const imageHandler = (e) => {
    setError("");
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (files.length + images.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, WEBP images allowed");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError("Each image must be under 2MB");
        return;
      }
    }

    setImages((prev) => [...prev, ...files]);
    setPreview((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const name = form.name.value.trim();
    const price = Number(form.price.value);
    const stock = Number(form.countInStock.value);
    const category = form.category.value;

    if (!name || price <= 0 || stock < 0 || !category) {
      setError("Please fill all required fields correctly");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one product image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("countInStock", stock);
      formData.append("category", category);
      formData.append("description", form.description.value);
      formData.append("isNewArrival", isNewArrival);
      formData.append("isFeatured", isFeatured);

      images.forEach((img) => formData.append("images", img));

      await api.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* LEFT */}
        <div className="space-y-5">
          <input
            name="name"
            placeholder="Product Name"
            className="input"
            disabled={loading}
            required
          />

          <input
            name="price"
            type="number"
            min="1"
            placeholder="Price"
            className="input"
            disabled={loading}
            required
          />

          <input
            name="countInStock"
            type="number"
            min="0"
            placeholder="Stock Quantity"
            className="input"
            disabled={loading}
            required
          />

          <select
            name="category"
            className="input"
            disabled={loading}
            required
          >
            <option value="">Select Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="electronics">Electronics</option>
            <option value="shoes">Shoes</option>
          </select>

          <textarea
            name="description"
            rows={5}
            placeholder="Product Description"
            className="input"
            disabled={loading}
          />

          <label className="flex gap-3 items-center text-sm font-medium">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
            />
            Mark as New Arrival
          </label>

          <label className="flex gap-3 items-center text-sm font-medium">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Mark as Featured
          </label>
        </div>

        {/* RIGHT – IMAGES */}
        <div>
          <label className="block font-medium mb-2">
            Product Images (max {MAX_IMAGES})
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={loading}
            onChange={imageHandler}
          />

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {preview.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    className="w-full h-28 object-cover rounded-xl"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full
                               opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-5 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className={`px-6 py-2 rounded-xl text-white font-medium
              ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
