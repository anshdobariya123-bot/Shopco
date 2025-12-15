import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addAddress,
  updateAddress,
  fetchSingleAddress,
} from "../api/addressApi";

/* ✅ FULL INDIA STATES + UTs */
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function AddEditAddress() {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ edit mode if exists

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  /* ✅ LOAD ADDRESS (EDIT MODE) */
  useEffect(() => {
    if (!id) return;

    const loadAddress = async () => {
      try {
        const data = await fetchSingleAddress(id);

        if (!data) return;

        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          addressLine1: data.addressLine1 || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: "India",
          isDefault: Boolean(data.isDefault),
        });
      } catch (error) {
        console.error("Failed to load address", error);
      }
    };

    loadAddress();
  }, [id]);

  /* ✅ VALIDATION */
  const validate = () => {
    const e = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required";

    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter valid 10-digit mobile number";

    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required";

    if (!form.city.trim()) e.city = "City is required";

    if (!STATES.includes(form.state)) e.state = "Select a valid Indian state";

    if (!/^\d{6}$/.test(form.postalCode))
      e.postalCode = "Enter valid 6-digit pincode";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ✅ SUBMIT */

const submitHandler = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    id ? await updateAddress(id, form) : await addAddress(form);

    navigate("/cart", {
      replace: true,
      state: { refresh: true },
    });
  } catch (err) {
    console.error("Failed to save address", err);
  }
};

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Edit Address" : "Add New Address"}
      </h1>

      <form onSubmit={submitHandler} className="space-y-4">
        <Input label="Full Name" error={errors.fullName}>
          <input
            className="input"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </Input>

        <Input label="Mobile Number" error={errors.phone}>
          <input
            className="input"
            maxLength={10}
            inputMode="numeric"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, ""),
              })
            }
          />
        </Input>

        <Input label="House / Street / Locality" error={errors.addressLine1}>
          <input
            className="input"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />
        </Input>

        <Input label="City" error={errors.city}>
          <input
            className="input"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </Input>

        {/* ✅ SEARCHABLE STATE INPUT */}
        <Input label="State" error={errors.state}>
          <input
            list="state-list"
            className="input"
            placeholder="Start typing state name"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />

          <datalist id="state-list">
            {STATES.map((state) => (
              <option key={state} value={state} />
            ))}
          </datalist>
        </Input>

        <Input label="Pincode" error={errors.postalCode}>
          <input
            className="input"
            maxLength={6}
            value={form.postalCode}
            onChange={(e) =>
              setForm({
                ...form,
                postalCode: e.target.value.replace(/\D/g, ""),
              })
            }
          />
        </Input>

        <Input label="Country">
          <input
            className="input bg-gray-100 cursor-not-allowed"
            value="India"
            disabled
          />
        </Input>

        <label className="flex gap-2 text-sm items-center">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          Set as default address
        </label>

        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg">
          Save Address
        </button>
      </form>
    </div>
  );
}

/* ✅ REUSABLE INPUT COMPONENT */
function Input({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
