import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { IoMenu, IoClose } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/* ================= SEARCH INPUT ================= */
const SearchInput = React.memo(({ onSubmit }) => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate(`/search?q=${value}`);
    onSubmit?.();
  };

  return (
    <>
      {/* DESKTOP */}
      <form onSubmit={submit} className="hidden sm:block">
        <div className="p-0.5 rounded-full bg-linear-to-r from-indigo-500 to-pink-500">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 h-10">
            <FaSearch className="text-indigo-500" />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search products…"
              className="outline-none bg-transparent w-44"
            />
          </div>
        </div>
      </form>

      {/* MOBILE */}
      <form onSubmit={submit} className="sm:hidden px-4 py-2">
        <div className="p-0.5 rounded-full bg-linear-to-r from-indigo-500 to-pink-500">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-white rounded-full px-4 py-2 outline-none"
          />
        </div>
      </form>
    </>
  );
});

/* ================= NAVBAR ================= */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  const { cartCount, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Men", path: "/category/men" },
      { name: "Women", path: "/category/women" },
      { name: "Electronics", path: "/category/electronics" },
      { name: "Shoes", path: "/category/shoes" },
    ],
    []
  );

  /* CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }

      if (
        mobileRef.current &&
        !mobileRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* LOCK SCROLL */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const logoutHandler = useCallback(() => {
    logout();
    clearCart();
    setOpenProfile(false);
    setOpen(false);
    navigate("/login");
  }, [logout, clearCart, navigate]);

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b">
        <div className="flex items-center h-16 px-4 md:px-16">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-extrabold bg-linear-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent"
          >
            Shopco
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-10 ml-12 font-medium">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600"
                    : "hover:text-indigo-600"
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-4">
            <SearchInput onSubmit={() => setOpen(false)} />

            {/* CART */}
            <Link to="/cart" className="relative p-2 rounded-full">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-linear-to-r from-indigo-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* AUTH DESKTOP */}
            {!user ? (
              <Link
                to="/login"
                className="hidden md:block px-5 py-1.5 rounded-full text-white bg-linear-to-r from-indigo-500 to-pink-500"
              >
                Login
              </Link>
            ) : (
              <div ref={profileRef} className="hidden md:block relative">
                <div
                  onClick={() => setOpenProfile((v) => !v)}
                  className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center bg-linear-to-r from-indigo-500 to-pink-500 text-white font-bold uppercase"
                >
                  {user.name?.charAt(0)}
                </div>

                {openProfile && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        My Profile
                      </Link>
                      <Link to="/my-orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        My Orders
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                        >
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t">
                      <button
                        onClick={logoutHandler}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              <IoMenu size={26} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div
            ref={mobileRef}
            className="bg-white w-72 h-full p-6 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <IoClose size={26} />
              </button>
            </div>

            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mb-6 text-center py-3 rounded-full text-white bg-linear-to-r from-indigo-500 to-pink-500 font-semibold"
              >
                Login / Sign Up
              </Link>
            ) : (
              <button
                onClick={logoutHandler}
                className="mb-6 py-3 rounded-full bg-red-100 text-red-600 font-medium"
              >
                Logout
              </button>
            )}

            <nav className="flex flex-col gap-4 text-lg font-medium">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="py-3 border-b"
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(Navbar);
