import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!q) {
      setProducts([]);
      return;
    }

    const controller = new AbortController();

    const searchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          `/products/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError("Failed to fetch search results");
        }
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
    return () => controller.abort();
  }, [q]);

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-6">
        {q ? (
          <>
            Search results for{" "}
            <span className="text-indigo-600">"{q}"</span>
          </>
        ) : (
          "Search Products"
        )}
      </h2>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Searching products…
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* EMPTY QUERY */}
      {!q && !loading && (
        <p className="text-gray-500 text-center">
          Start typing to search for products.
        </p>
      )}

      {/* NO RESULTS */}
      {!loading && q && products.length === 0 && (
        <p className="text-gray-500 text-center">
          No products found for "{q}"
        </p>
      )}

      {/* RESULTS */}
      {products.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {products.length} result
            {products.length > 1 ? "s" : ""} found
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
