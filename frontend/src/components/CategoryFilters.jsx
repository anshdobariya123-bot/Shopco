export default function CategoryFilters({
  priceFilter,
  setPriceFilter,
  sort,
  setSort,
  inline = false,
}) {
  const radioName = inline ? "price-inline" : "price-sidebar";

  return (
    <div
      className={`${
        inline
          ? "space-y-6"
          : "bg-white border rounded-2xl p-6 space-y-6 shadow-sm"
      }`}
    >
      {/* PRICE */}
      <div>
        <h3 className="font-semibold mb-3">Price</h3>

        <div className="space-y-2 text-sm">
          {[
            { label: "Under ₹500", value: "UNDER_500" },
            { label: "₹500 – ₹1000", value: "500_1000" },
            { label: "₹1000 – ₹2000", value: "1000_2000" },
            { label: "₹2000 & Above", value: "ABOVE_2000" }, // ✅ NEW
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 cursor-pointer hover:text-indigo-600"
            >
              <input
                type="radio"
                name={radioName}
                checked={priceFilter === item.value}
                onChange={() => setPriceFilter(item.value)}
                className="accent-indigo-600"
              />
              {item.label}
            </label>
          ))}

          {priceFilter && (
            <button
              onClick={() => setPriceFilter("")}
              className="text-xs text-indigo-600 hover:underline mt-2"
            >
              Clear price filter
            </button>
          )}
        </div>
      </div>

      {/* SORT */}
      <div>
        <h3 className="font-semibold mb-3">Sort by</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
