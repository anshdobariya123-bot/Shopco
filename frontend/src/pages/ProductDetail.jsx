import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const IMAGE_BASE =  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";

/* ✅ SAFE IMAGE HELPER */
const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([]);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/products/${id}`, {
          signal: controller.signal,
        });

        setProduct(data);
        setActiveImage(data?.images?.[0] || null);

        /* 🔥 FETCH RECOMMENDED (same category) */
        if (data?.category) {
          const rec = await api.get(
            `/products?category=${data.category}&limit=8`
          );

          setRecommended(rec.data.filter((p) => p._id !== data._id));
        }
      } catch (err) {
  if (err.name !== "CanceledError") {
    console.error(err);

    if (err.response?.status === 404 || err.response?.status === 400) {
      setError("NOT_FOUND");
    } else {
      setError("GENERIC");
    }
  }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  /* ================= STATES ================= */
  if (loading) {
    return <p className="p-10 text-center text-gray-500">Loading product…</p>;
  }

 if (error === "NOT_FOUND") {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <img
        src="/product-not-found.png"
        alt="Product not found"
        className="w-72 mb-6 opacity-80"
      />

      <h2 className="text-2xl font-semibold mb-2">
        Product not found
      </h2>

      <p className="text-gray-500 mb-6 max-w-md">
        The product you are looking for doesn’t exist or may have been removed.
      </p>

      <Link
        to="/"
        className="text-indigo-600 font-medium hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

if (error === "GENERIC") {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-red-500">
      Failed to load product. Please try again.
    </div>
  );
}

  if (!product) {
    return <p className="p-10 text-center text-gray-500">Product not found</p>;
  }

  /* ================= ADD TO CART ================= */
  const addToCartHandler = () => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      qty,
      countInStock: product.countInStock ?? 0,
    });
  };

  return (
    <>
      {/* ================= PRODUCT DETAILS ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* ================= LEFT – IMAGE GALLERY ================= */}
          <div>
            {/* MAIN IMAGE */}
            <div className="rounded-3xl bg-gray-100 shadow-xl overflow-hidden">
              <div className="relative w-full aspect-4/5">
                <img
                  src={getImageUrl(activeImage)}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full
                             object-contain bg-white
                             transition-transform duration-700
                             hover:scale-105"
                />
              </div>
            </div>

            {/* THUMBNAILS */}
            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-3 flex-wrap">
                {product.images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`rounded-xl border-2 p-1 transition
                      ${
                        activeImage === img
                          ? "border-indigo-500"
                          : "border-transparent hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={product.name}
                      className="w-20 h-20 object-contain bg-white rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT – PRODUCT INFO ================= */}
          <div className="space-y-6">
            <span
              className="inline-block text-xs uppercase tracking-widest
                             bg-gray-100 px-3 py-1 rounded-full"
            >
              {product.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold">
              {product.name}
            </h1>

            <p
              className="text-3xl font-bold bg-linear-to-r
                          from-indigo-500 to-pink-500
                          bg-clip-text text-transparent"
            >
              ₹{product.price.toLocaleString()}
            </p>

            <p className="text-gray-700 leading-relaxed">
              {product.description || "No description available."}
            </p>

            {/* AVAILABILITY */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Availability:</span>
              {product.countInStock > 0 ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                  In Stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
                  Out of Stock
                </span>
              )}
            </div>

            {/* QUANTITY */}
            {product.countInStock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>

                <div className="flex items-center border rounded-lg overflow-hidden">
                  {/* DECREASE */}
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200"
                  >
                    −
                  </button>

                  {/* VALUE */}
                  <span className="px-4 py-2 min-w-10 text-center font-medium">
                    {qty}
                  </span>

                  {/* INCREASE */}
                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) =>
                        Math.min(q + 1, Math.min(product.countInStock, 10))
                      )
                    }
                    className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs text-gray-500">
                  (Max {Math.min(product.countInStock, 10)})
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
              className={`w-full sm:w-auto px-12 py-4 rounded-full
                text-white font-semibold text-lg
                ${
                  product.countInStock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-90"
                }`}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* ================= RECOMMENDED PRODUCTS ================= */}
      {recommended.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-8">You may also like</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {recommended.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
