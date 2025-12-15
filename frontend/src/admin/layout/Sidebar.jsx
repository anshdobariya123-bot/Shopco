import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-xl transition";

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:fixed z-50
          top-0 left-0 h-full w-64
          bg-white border-r shadow-sm
          px-6 py-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-extrabold text-indigo-600">
            Admin Panel
          </h1>

          {/* CLOSE BUTTON (MOBILE) */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-800"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-2 text-gray-600 text-sm font-medium">
          <NavLink
            to="/admin"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-100 hover:text-indigo-600"
              }`
            }
          >
            <FiGrid size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-100 hover:text-indigo-600"
              }`
            }
          >
            <FiBox size={18} />
            Products
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-100 hover:text-indigo-600"
              }`
            }
          >
            <FiShoppingCart size={18} />
            Orders
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-100 hover:text-indigo-600"
              }`
            }
          >
            <FiUsers size={18} />
            Users
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
