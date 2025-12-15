import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

/* ================= CONFIG ================= */
const IMAGE_BASE =
  import.meta.env.VITE_IMAGE_BASE_URL ;

/* ================= HELPERS ================= */
const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

/* ================= COMPONENT ================= */
const ProductCard = ({ product }) => {
  const { _id, name, price, images = [], category } = product;

  const firstImage = images[0];
  const secondImage = images[1];

  const image1 = useMemo(() => getImageUrl(firstImage), [firstImage]);
  const image2 = useMemo(() => getImageUrl(secondImage), [secondImage]);

  const handleWishlistClick = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <Link to={`/product/${_id}`} className="group block">
      {/* IMAGE */}
      <div
        className="relative w-full aspect-3/4 overflow-hidden 
                   rounded-2xl bg-gray-100 
                   shadow-sm group-hover:shadow-xl 
                   transition duration-300"
      >
        {/* IMAGE 1 */}
        <img
          src={image1}
          alt={name}
          loading="lazy"
          className={`w-full h-full object-cover 
            transition-opacity duration-500 
            ${secondImage ? "group-hover:opacity-0" : ""}`}
        />

        {/* IMAGE 2 (HOVER) */}
        {secondImage && (
          <img
            src={image2}
            alt={`${name} hover`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover 
                       opacity-0 group-hover:opacity-100 
                       transition-opacity duration-500"
          />
        )}

        {/* CATEGORY BADGE */}
        {category && (
          <span
            className="absolute top-3 left-3 
                       text-xs font-medium capitalize 
                       px-3 py-1 rounded-full 
                       bg-white/90 backdrop-blur"
          >
            {category}
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 
                     flex items-center justify-center
                     rounded-full bg-white/90 backdrop-blur
                     opacity-0 group-hover:opacity-100
                     transition"
        >
          <FiHeart className="text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* INFO */}
      <div className="mt-4 space-y-1">
        <p
          className="text-sm font-medium text-gray-800 
                     line-clamp-2 group-hover:text-indigo-600 transition"
        >
          {name}
        </p>

        <p
          className="text-lg font-bold 
                     bg-linear-to-r from-indigo-500 to-pink-500
                     bg-clip-text text-transparent"
        >
          ₹{Number(price || 0).toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

export default memo(ProductCard);
