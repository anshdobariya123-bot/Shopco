import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchAddresses, deleteAddress } from "../api/addressApi";
import { placeOrder } from "../api/orderApi";

/* ================= CONFIG ================= */
const IMAGE_BASE =
  import.meta.env.VITE_IMAGE_BASE_URL ;

const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  /* ================= ADDRESS STATE ================= */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  /* ================= CART CALCULATIONS ================= */
  const { itemsCount, itemsPrice, taxPrice, shippingPrice, totalPrice } =
    useMemo(() => {
      const itemsCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
      const itemsPrice = cartItems.reduce((acc, i) => acc + i.qty * i.price, 0);
      const taxPrice = Math.round(itemsPrice * 0.02);
      const shippingPrice = itemsPrice > 500 ? 0 : 50;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      return {
        itemsCount,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };
    }, [cartItems]);

  /* ================= FETCH ADDRESSES ================= */
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const data = await fetchAddresses();
        setAddresses(data);

        const defaultAddress = data.find((a) => a.isDefault);
        setSelectedAddress(defaultAddress?._id || null);
      } catch (error) {
        console.error("Failed to load addresses", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  const selectedAddressObj = useMemo(
    () => addresses.find((a) => a._id === selectedAddress),
    [addresses, selectedAddress]
  );

  /* ================= HANDLERS ================= */
  const deleteAddressHandler = useCallback(
    async (id) => {
      if (!window.confirm("Delete this address?")) return;

      await deleteAddress(id);
      const updated = addresses.filter((a) => a._id !== id);
      setAddresses(updated);

      if (selectedAddress === id) {
        const newDefault = updated.find((a) => a.isDefault);
        setSelectedAddress(newDefault?._id || null);
      }
    },
    [addresses, selectedAddress]
  );

  const updateCartQty = useCallback(
    (productId, qty) => {
      const item = cartItems.find((i) => i.product === productId);
      if (!item) return;

      addToCart({
        ...item,
        qty,
      });
    },
    [cartItems, addToCart]
  );

  const placeOrderHandler = useCallback(async () => {
    if (!selectedAddressObj) {
      alert("Please select delivery address");
      return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        shippingAddress: {
          fullName: selectedAddressObj.fullName,
          phone: selectedAddressObj.phone,
          addressLine1: selectedAddressObj.addressLine1,
          city: selectedAddressObj.city,
          state: selectedAddressObj.state,
          postalCode: selectedAddressObj.postalCode,
          country: selectedAddressObj.country,
        },
        paymentMethod: "COD",
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const createdOrder = await placeOrder(orderData);
      clearCart();
      navigate(`/order/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  }, [
    cartItems,
    selectedAddressObj,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    clearCart,
    navigate,
  ]);

  /* ================= EMPTY CART ================= */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-semibold mb-3">Your cart is empty 🛒</h2>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">
          Continue Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* ================= CART ITEMS ================= */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-extrabold">
          Shopping Cart{" "}
          <span className="text-sm text-indigo-500">({itemsCount} items)</span>
        </h1>

        {cartItems.map((item) => (
          <div
            key={item.product}
            className="flex flex-col sm:flex-row gap-6 bg-white rounded-2xl shadow-sm border p-4"
          >
            {/* IMAGE */}
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link
                  to={`/product/${item.product}`}
                  className="font-semibold text-lg hover:underline"
                >
                  {item.name}
                </Link>

                <p className="text-gray-500 text-sm mt-1">
                  Price: ₹{item.price.toLocaleString()}
                </p>
              </div>

              {/* QTY */}
              <div className="flex items-center gap-4 mt-3">
                <label className="text-sm font-medium">Qty</label>
                {item.countInStock > 0 && (
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    {/* DECREASE */}
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQty(item.product, Math.max(1, item.qty - 1))
                      }
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      −
                    </button>

                    {/* VALUE */}
                    <span className="px-4 py-1 min-w-10 text-center">
                      {item.qty}
                    </span>

                    {/* INCREASE */}
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQty(
                          item.product,
                          Math.min(item.qty + 1, item.countInStock)
                        )
                      }
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PRICE + REMOVE */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between">
              <p className="text-lg font-semibold text-indigo-600">
                ₹{(item.price * item.qty).toLocaleString()}
              </p>

              <button
                onClick={() => removeFromCart(item.product)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-500 font-medium mt-4 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>

      {/* ================= ORDER SUMMARY ================= */}
      <div className="bg-gray-50 border rounded-2xl p-6 h-fit sticky top-24">
        <h2 className="text-xl font-semibold mb-5">Order Summary</h2>

        {/* ADDRESS */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase text-gray-600">
            Delivery Address
          </p>

          <div className="relative flex justify-between mt-2">
            <p className="text-gray-500 text-sm">
              {selectedAddressObj
                ? `${selectedAddressObj.addressLine1}, ${selectedAddressObj.city}`
                : loadingAddresses
                ? "Loading addresses..."
                : "No address selected"}
            </p>

            <button
              onClick={() => setShowAddress((v) => !v)}
              className="text-indigo-600 text-sm font-medium"
            >
              Change
            </button>

            {showAddress && (
              <div className="absolute top-8 left-0 bg-white border rounded w-full z-10">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="px-4 py-3 hover:bg-gray-100"
                  >
                    <p
                      onClick={() => {
                        setSelectedAddress(address._id);
                        setShowAddress(false);
                      }}
                      className="cursor-pointer"
                    >
                      {address.addressLine1}, {address.city}
                    </p>

                    <div className="flex gap-3 text-sm mt-1">
                      <Link
                        to={`/edit-address/${address._id}`}
                        className="text-indigo-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteAddressHandler(address._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                <Link
                  to="/add-address"
                  className="block px-4 py-2 text-center text-indigo-600 hover:bg-indigo-50"
                >
                  + Add Address
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* PRICE SUMMARY */}
        <div className="space-y-2 text-gray-700">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{itemsPrice.toLocaleString()}</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>₹{taxPrice}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">
              {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
            </span>
          </p>

          <div className="flex justify-between text-lg font-semibold pt-3 border-t">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={placeOrderHandler}
          disabled={!selectedAddressObj}
          className={`w-full mt-6 py-3 rounded-full text-white font-semibold
            ${
              selectedAddressObj
                ? "bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
