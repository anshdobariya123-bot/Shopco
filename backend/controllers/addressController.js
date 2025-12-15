import User from "../models/User.js";

/* ================= GET ALL ================= */
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

/* ================= GET SINGLE ================= */
export const getSingleAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch address" });
  }
};

/* ================= ADD ================= */
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !postalCode || !country) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    // ✅ PHONE (INDIA)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // ✅ PINCODE
    if (!/^\d{6}$/.test(postalCode)) {
      return res.status(400).json({ message: "Invalid pincode" });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);
    res.status(500).json({ message: "Failed to add address" });
  }
};

/* ================= UPDATE ================= */
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const { phone, postalCode, isDefault } = req.body;

    // ✅ Validate only if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (postalCode && !/^\d{6}$/.test(postalCode)) {
      return res.status(400).json({ message: "Invalid pincode" });
    }

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.json(address);
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
};

/* ================= DELETE ================= */
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();

    res.json({ message: "Address removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};
