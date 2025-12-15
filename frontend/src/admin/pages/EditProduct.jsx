import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { X } from "lucide-react";

const IMAGE_BASE = VITE_IMAGE_BASE_URL;
const MAX_IMAGES = 6;

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);

  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await api.get(`/admin/products/${id}`);
        setProduct(data);
        setIsNewArrival(!!data.isNewArrival);
        setIsFeatured(!!data.isFeatured);
      } catch {
        setError("Failed to load product");
      }
    };

    loadProduct();
  }, [id]);

  /* ================= CLEAN PREVIEWS ================= */
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  /* ================= ADD NEW IMAGES ================= */
  const imageHandler = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const total =
      product.images.length + newImages.length + files.length;

    if (total > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
    setPreview((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  /* ================= REMOVE NEW IMAGE ================= */
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ================= REMOVE EXISTING IMAGE ================= */
  const removeExistingImage = (img) => {
    setRemoveImages((prev) => [...prev, img]);
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((i) => i !== img),
    }));
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
      setError("Please fill all fields correctly");
      return;
    }

    if (product.images.length + newImages.length === 0) {
      setError("At least one image is required");
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
      formData.append("imagesToRemove", JSON.stringify(removeImages));
      formData.append("isNewArrival", isNewArrival);
      formData.append("isFeatured", isFeatured);

      newImages.forEach((img) => formData.append("images", img));

      await api.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return <p className="p-6 text-gray-500">Loading product…</p>;
  }

  return (
    <div className="max-w-4xl bg-white p-6 md:p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

      {error && (
        <div className="mb-5 p-3 bg-red-100 text-red-700 rounded-lg">
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
            defaultValue={product.name}
            className="w-full border px-4 py-3 rounded-xl"
            required
          />

          <input
            name="price"
            type="number"
            defaultValue={product.price}
            min="1"
            className="w-full border px-4 py-3 rounded-xl"
            required
          />

          <input
            name="countInStock"
            type="number"
            defaultValue={product.countInStock}
            min="0"
            className="w-full border px-4 py-3 rounded-xl"
            required
          />

          <select
            name="category"
            defaultValue={product.category}
            className="w-full border px-4 py-3 rounded-xl"
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="electronics">Electronics</option>
            <option value="shoes">Shoes</option>
          </select>

          <textarea
            name="description"
            defaultValue={product.description}
            rows={5}
            className="w-full border px-4 py-3 rounded-xl"
          />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
            />
            New Arrival
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Featured
          </label>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* EXISTING IMAGES */}
          <div>
            <p className="font-medium mb-2">Existing Images</p>
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, i) => (
                <div key={img} className="relative border rounded-xl">
                  <img
                    src={`${IMAGE_BASE}/${img.replace(/^\//, "")}`}
                    className="w-24 h-24 object-cover"
                  />

                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-indigo-600 text-white px-2 rounded">
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ADD NEW */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={imageHandler}
          />

          {/* PREVIEW */}
          {preview.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {preview.map((img, i) => (
                <div key={i} className="relative border rounded-xl">
                  <img src={img} className="w-20 h-20 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
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
            className="px-5 py-2 border rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white"
          >
            {loading ? "Updating…" : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
