import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const IMAGE_BASE =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";

const getImageUrl = (img) =>
  img ? `${IMAGE_BASE}/${img.replace(/^\//, "")}` : "/no-image.png";

export default function AdminOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ORDER ================= */
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data);
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (endpoint, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;

    try {
      setUpdating(true);
      await api.put(endpoint);
      await loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <p className="p-8 text-center text-gray-500">
        Loading order…
      </p>
    );

  if (error)
    return (
      <p className="p-8 text-center text-red-600">
        {error}
      </p>
    );

  /* ================= STATUS BADGE ================= */
  const statusBadge = () => {
    if (order.isCancelled)
      return <Badge color="red" text="Cancelled" />;
    if (order.isDelivered)
      return <Badge color="green" text="Delivered" />;
    if (order.isShipped)
      return <Badge color="blue" text="Shipped" />;
    return <Badge color="yellow" text="Processing" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Order #{order._id.slice(-6)}
        </h1>
        {statusBadge()}
      </div>

      {/* CUSTOMER */}
      <Section title="Customer">
        <p className="font-medium">{order.user?.name}</p>
        <p className="text-sm text-gray-600">{order.user?.email}</p>
      </Section>

      {/* PAYMENT */}
      <Section title="Payment">
        <p>
          Method:{" "}
          <span className="font-medium">
            {order.paymentMethod}
          </span>
        </p>
        <p>
          Status:{" "}
          {order.isPaid ? (
            <span className="text-green-600 font-medium">
              Paid
            </span>
          ) : (
            <span className="text-yellow-600 font-medium">
              Pending
            </span>
          )}
        </p>
      </Section>

      {/* SHIPPING */}
      <Section title="Shipping Address">
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.addressLine1}</p>
        <p>
          {order.shippingAddress.city},{" "}
          {order.shippingAddress.state}
        </p>
        <p>📞 {order.shippingAddress.phone}</p>
      </Section>

      {/* ITEMS */}
      <Section title="Items">
        <div className="divide-y">
          {order.orderItems.map((item) => (
            <div
              key={item.product}
              className="flex items-center gap-4 py-3"
            >
              <img
                src={getImageUrl(item.image)}
                className="w-14 h-14 rounded border object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.qty}
                </p>
              </div>
              <p className="font-semibold">
                ₹{(item.price * item.qty).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* SUMMARY */}
      <Section title="Summary">
        <SummaryRow label="Items" value={order.itemsPrice} />
        <SummaryRow label="Tax" value={order.taxPrice} />
        <SummaryRow label="Shipping" value={order.shippingPrice} />
        <SummaryRow label="Total" value={order.totalPrice} strong />
      </Section>

      {/* TIMELINE */}
      <Section title="Order Timeline">
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🕒 Placed: {new Date(order.createdAt).toLocaleString()}</li>
          {order.isShipped && (
            <li>🚚 Shipped: {new Date(order.shippedAt).toLocaleString()}</li>
          )}
          {order.isDelivered && (
            <li>✅ Delivered: {new Date(order.deliveredAt).toLocaleString()}</li>
          )}
          {order.isCancelled && (
            <li>❌ Cancelled: {new Date(order.cancelledAt).toLocaleString()}</li>
          )}
        </ul>
      </Section>

      {/* ACTIONS */}
      <div className="flex gap-3 flex-wrap">
        {!order.isCancelled && !order.isShipped && (
          <AdminBtn
            label="Ship Order"
            color="blue"
            disabled={updating}
            onClick={() =>
              updateStatus(`/admin/orders/${id}/ship`)
            }
          />
        )}

        {order.isShipped && !order.isDelivered && (
          <AdminBtn
            label="Mark Delivered"
            color="green"
            disabled={updating}
            onClick={() =>
              updateStatus(`/admin/orders/${id}/deliver`)
            }
          />
        )}

        {!order.isDelivered && !order.isCancelled && (
          <AdminBtn
            label="Cancel Order"
            color="red"
            disabled={updating}
            onClick={() =>
              updateStatus(
                `/admin/orders/${id}/cancel`,
                "Cancel this order?"
              )
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children }) {
  return (
    <section className="bg-white border rounded-xl p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </section>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div
      className={`flex justify-between py-1 ${
        strong ? "font-bold text-lg" : ""
      }`}
    >
      <span>{label}</span>
      <span>₹{value.toLocaleString()}</span>
    </div>
  );
}

function AdminBtn({ label, onClick, disabled, color }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg text-white font-medium transition
        ${colors[color]} disabled:bg-gray-400`}
    >
      {disabled ? "Processing..." : label}
    </button>
  );
}

function Badge({ text, color }) {
  const colors = {
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm ${colors[color]}`}
    >
      {text}
    </span>
  );
}
