import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategoryFilters from "../components/CategoryFilters";
import { getProductsByCategory } from "../api/productApi";

/* ================= VALID CATEGORIES ================= */
const VALID_CATEGORIES = [
  "men",
  "women",
  "electronics",
  "shoes",
  "kids",
];

/* ================= PRICE RANGES ================= */
const PRICE_RANGES = {
  UNDER_500: (p) => p.price < 500,
  "500_1000": (p) => p.price >= 500 && p.price <= 1000,
  "1000_2000": (p) => p.price >= 1000 && p.price <= 2000,
  ABOVE_2000: (p) => p.price > 2000,
};

export default function CategoryPage() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priceFilter, setPriceFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [openFilters, setOpenFilters] = useState(false);

  /* ================= INVALID CATEGORY ================= */
  if (!VALID_CATEGORIES.includes(category)) {
    return <Navigate to="/404" replace />;
  }

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setPriceFilter("");
    setSort("newest");

    getProductsByCategory(category, { signal: controller.signal })
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError("Failed to load products");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category]);

  /* ================= FILTER + SORT (SAFE) ================= */
  const filteredProducts = useMemo(() => {
    let list = products;

    if (priceFilter && PRICE_RANGES[priceFilter]) {
      list = list.filter(PRICE_RANGES[priceFilter]);
    }

    const sorted = [...list]; // ✅ SAFE COPY

    switch (sort) {
      case "low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    return sorted;
  }, [products, priceFilter, sort]);

  /* ================= LOCK SCROLL (MOBILE FILTER) ================= */
  useEffect(() => {
    document.body.style.overflow = openFilters ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openFilters]);

  return (
    <div className="px-4 md:px-16 lg:px-24 py-10 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold capitalize">
            {category}
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length} products available
          </p>
        </div>

        {/* MOBILE FILTER BUTTON */}
        <div className="lg:hidden">
          <button
            onClick={() => setOpenFilters(true)}
            className="px-4 py-2 rounded-full border font-medium
                       flex items-center gap-2 text-sm
                       hover:bg-gray-50"
          >
            Filters & Sort
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* DESKTOP FILTER */}
        <aside className="hidden lg:block w-1/5 sticky top-24 self-start">
          <CategoryFilters
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            sort={sort}
            setSort={setSort}
          />
        </aside>

        {/* PRODUCTS */}
        <main className="w-full lg:w-4/5">
          {/* ERROR */}
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-100 animate-pulse rounded-xl"
                />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="bg-gray-50 rounded-xl py-16 text-center text-gray-500">
              No products found.
            </div>
          )}

          {/* GRID */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ================= MOBILE FILTER MODAL ================= */}
      {openFilters && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div
            className="absolute bottom-0 left-0 right-0 bg-white
                       rounded-t-3xl p-6 animate-slideUp"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filter & Sort</h2>
              <button
                onClick={() => setOpenFilters(false)}
                className="text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>

            <CategoryFilters
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
              sort={sort}
              setSort={setSort}
              inline
            />

            {/* ACTIONS */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setPriceFilter("");
                  setSort("newest");
                }}
                className="flex-1 py-3 rounded-full border font-medium"
              >
                Clear
              </button>

              <button
                onClick={() => setOpenFilters(false)}
                className="flex-1 py-3 rounded-full
                           bg-indigo-600 text-white font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
