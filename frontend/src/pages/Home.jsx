import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getNewArrivals } from "../api/productApi";

/* ================= CONSTANTS ================= */
const CATEGORIES = ["men", "women", "electronics", "shoes"];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH NEW ARRIVALS ================= */
  useEffect(() => {
    const controller = new AbortController();

    const loadNewArrivals = async () => {
      try {
        setLoading(true);
        const res = await getNewArrivals({
          signal: controller.signal,
        });
        setNewArrivals(res.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError("Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    loadNewArrivals();
    return () => controller.abort();
  }, []);

  const categoryCards = useMemo(
    () =>
      CATEGORIES.map((cat) => (
        <Link
          key={cat}
          to={`/category/${cat}`}
          className="group bg-white border rounded-2xl p-6 text-center
                     hover:shadow-xl transition"
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-full
                       bg-linear-to-r from-indigo-500 to-pink-500
                       text-white grid place-items-center font-bold text-lg"
          >
            {cat[0].toUpperCase()}
          </div>

          <p className="text-lg font-medium capitalize group-hover:text-indigo-600">
            {cat}
          </p>
        </Link>
      )),
    []
  );

  return (
    <div className="w-full overflow-hidden">
      {/* ================= HERO ================= */}
      <section
        className="relative bg-linear-to-br from-indigo-50 to-pink-50 
                   py-20 px-6 md:px-16 lg:px-24 xl:px-32"
      >
        <div className="flex flex-col md:flex-row items-center gap-14">
          {/* TEXT */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight">
              Discover the Latest{" "}
              <span
                className="bg-linear-to-r from-indigo-500 to-pink-500 
                           bg-clip-text text-transparent"
              >
                Arrivals
              </span>
            </h1>

            <p className="text-gray-600 text-lg max-w-xl">
              Shop trendy, high-quality products crafted to make your style
              stand out — all at unbeatable prices.
            </p>

            <div className="flex gap-4 pt-4">
              <Link
                to="/shop"
                className="px-7 py-3 rounded-full text-white font-medium
                           bg-linear-to-r from-indigo-500 to-pink-500
                           hover:opacity-90 transition shadow-md"
              >
                Shop Now
              </Link>

              <Link
                to="/contact"
                className="px-7 py-3 rounded-full font-medium
                           border-2 border-indigo-500 text-indigo-600
                           hover:bg-indigo-50 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* IMAGE */}
          <div className="flex-1 flex justify-center">
            <img
              src="https://img.freepik.com/free-photo/woman-shopping-bags_23-2148016034.jpg"
              alt="Shopping"
              loading="lazy"
              className="rounded-3xl shadow-2xl max-w-[480px]
                         hover:scale-105 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* ================= CATEGORY ================= */}
      <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categoryCards}
        </div>
      </section>

      {/* ================= NEW ARRIVALS ================= */}
      <section className="bg-gray-50 px-6 md:px-16 lg:px-24 xl:px-32 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">
          New Arrivals
        </h2>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* PRODUCTS */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-16">
        <div
          className="bg-linear-to-r from-indigo-500 to-pink-500
                     rounded-3xl p-10 md:p-14 
                     flex flex-col md:flex-row justify-between items-center gap-6
                     text-white shadow-xl"
        >
          <h2 className="text-2xl md:text-3xl font-semibold max-w-xl">
            Get <span className="font-extrabold">20% OFF</span> on Your First
            Order!
          </h2>

          <Link
            to="/shop"
            className="bg-white text-indigo-600 px-8 py-3 rounded-full
                       font-medium hover:scale-105 transition shadow"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
