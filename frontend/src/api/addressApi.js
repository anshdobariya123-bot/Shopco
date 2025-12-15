import api from "./axios";

export const fetchAddresses = async () => {
  const { data } = await api.get("/addresses");
  return data;
};

export const fetchSingleAddress = async (id) => {
  const { data } = await api.get(`/addresses/${id}`);
  return data;
};

export const addAddress = async (address) => {
  const { data } = await api.post("/addresses", address);
  return data;
};

export const updateAddress = async (id, address) => {
  const { data } = await api.put(`/addresses/${id}`, address);
  return data;
};

export const deleteAddress = async (id) => {
  await api.delete(`/addresses/${id}`);
};


