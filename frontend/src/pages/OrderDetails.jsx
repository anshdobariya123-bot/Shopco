import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById } from "../api/orderApi";
import api from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* ================= CONFIG ================= */
const IMAGE_BASE =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";

const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH ORDER ================= */
  const loadOrder = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        const data = await fetchOrderById(id, { signal });
        setOrder(data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError("Failed to load order details");
        }
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadOrder(controller.signal);
    return () => controller.abort();
  }, [loadOrder]);

  /* ================= CANCEL ORDER ================= */
  const cancelOrderHandler = useCallback(async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setActionLoading(true);
      await api.put(`/orders/${id}/cancel`);
      await loadOrder();
      alert("Order cancelled successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setActionLoading(false);
    }
  }, [id, loadOrder]);

  /* ================= INVOICE PDF ================= */
  const downloadInvoice = useCallback(() => {
    if (!order) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 30);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      14,
      36
    );

    // ADDRESS
    const a = order.shippingAddress;
    doc.text("Shipping Address:", 14, 48);
    doc.text(a.fullName, 14, 54);
    doc.text(a.addressLine1, 14, 60);
    doc.text(`${a.city}, ${a.state}`, 14, 66);
    doc.text(a.country, 14, 72);
    doc.text(`Phone: ${a.phone}`, 14, 78);

    // ITEMS TABLE
    const tableData = order.orderItems.map((item) => [
      item.name,
      item.qty,
      `₹${item.price}`,
      `₹${item.price * item.qty}`,
    ]);

    doc.autoTable({
      startY: 90,
      head: [["Product", "Qty", "Price", "Total"]],
      body: tableData,
    });

    // TOTALS
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Items: ₹${order.itemsPrice}`, 14, finalY);
    doc.text(`Tax: ₹${order.taxPrice}`, 14, finalY + 6);
    doc.text(`Shipping: ₹${order.shippingPrice}`, 14, finalY + 12);

    doc.setFontSize(14);
    doc.text(
      `Grand Total: ₹${order.totalPrice}`,
      14,
      finalY + 22
    );

    doc.save(`Invoice_${order._id}.pdf`);
  }, [order]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <p className="p-10 text-center text-gray-500">
        Loading order details…
      </p>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link
          to="/my-orders"
          className="text-indigo-600 font-medium hover:underline"
        >
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  /* ================= ORDER STEPS ================= */
  const orderSteps = [
    { title: "Order Placed", done: true, date: order.createdAt },
    { title: "Payment Confirmed", done: order.isPaid, date: order.paidAt },
    { title: "Shipped", done: order.isShipped, date: order.shippedAt },
    { title: "Delivered", done: order.isDelivered, date: order.deliveredAt },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Order Details</h1>

        <div className="flex gap-3">
          {order.isCancelled && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
              Cancelled
            </span>
          )}
          {order.isPaid && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
              Paid
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full ${
              order.isDelivered
                ? "bg-indigo-100 text-indigo-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.isDelivered ? "Delivered" : "Processing"}
          </span>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Order Status</h2>

        {order.isCancelled ? (
          <p className="text-red-600 font-medium">
            ❌ Order Cancelled on{" "}
            {new Date(order.cancelledAt).toLocaleDateString()}
          </p>
        ) : (
          <ol className="relative border-l border-gray-300 ml-3 space-y-8">
            {orderSteps.map((step, i) => (
              <li key={i} className="ml-6">
                <span
                  className={`absolute -left-3 w-6 h-6 rounded-full grid place-items-center
                    ${
                      step.done
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-500"
                    }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>

                <h3
                  className={`font-medium ${
                    step.done ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h3>

                {step.done && step.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(step.date).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* ITEMS */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        {order.orderItems.map((item) => (
          <div
            key={item.product}
            className="flex items-center gap-4 py-3 border-b last:border-b-0"
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.qty}</p>
            </div>
            <p className="font-semibold text-indigo-600">
              ₹{(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!order.isDelivered && !order.isCancelled && (
          <button
            onClick={cancelOrderHandler}
            disabled={actionLoading}
            className="px-6 py-3 rounded-full bg-red-100 text-red-600 font-medium hover:bg-red-200"
          >
            Cancel Order
          </button>
        )}

        <button
          onClick={downloadInvoice}
          className="px-6 py-3 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white font-medium hover:opacity-90"
        >
          Download Invoice (PDF)
        </button>
      </div>

      <Link
        to="/my-orders"
        className="inline-block text-indigo-600 font-medium hover:underline"
      >
        ← Back to My Orders
      </Link>
    </div>
  );
}
