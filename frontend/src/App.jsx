import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

/* ================== COMMON ================== */
import PageLoader from "./pages/PageLoader";

/* ================== LAYOUTS ================== */
import MainLayout from "./Layouts/MainLayout";
import AdminLayout from "./admin/layout/AdminLayout";

/* ================== ROUTE GUARDS ================== */
import ProtectedRoute from "./Layouts/ProtectedRoute";
import AdminRoute from "./Layouts/AdminRoute";

/* ================== PUBLIC PAGES ================== */
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

/* ================== USER PAGES ================== */
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const AddEditAddress = lazy(() => import("./pages/AddEditAddress"));

/* ================== ADMIN PAGES ================== */
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Products = lazy(() => import("./admin/pages/Products"));
const AddProduct = lazy(() => import("./admin/pages/AddProduct"));
const EditProduct = lazy(() => import("./admin/pages/EditProduct"));
const Orders = lazy(() => import("./admin/pages/Orders"));
const AdminOrderDetails = lazy(() => import("./admin/pages/AdminOrderDetails"));
const Users = lazy(() => import("./admin/pages/Users"));
const UserDetails = lazy(() => import("./admin/pages/UserDetails"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
  <Routes>

    {/* ================= AUTH ================= */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* ================= MAIN WEBSITE ================= */}
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="shop" element={<Shop />} />
      <Route path="category/:category" element={<CategoryPage />} />
      <Route path="product/:id" element={<ProductDetail />} />
      <Route path="search" element={<SearchPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="cart" element={<Cart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="order/:id" element={<OrderDetails />} />
        <Route path="add-address" element={<AddEditAddress />} />
        <Route path="edit-address/:id" element={<AddEditAddress />} />
      </Route>
    </Route>

    {/* ================= ADMIN PANEL ================= */}
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
      </Route>
    </Route>

    {/* ================= 404 ================= */}
    <Route path="*" element={<NotFound />} />

  </Routes>
</Suspense>
  );
}
