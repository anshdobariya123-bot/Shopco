import api from "./axios";

export const placeOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

export const fetchOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  return data;
};

export const fetchMyOrders = async () => {
  const { data } = await api.get("/orders/my", {
    headers: { "Cache-Control": "no-cache" },
  });
  return data;
};
