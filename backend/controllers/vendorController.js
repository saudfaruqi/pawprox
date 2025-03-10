


const vendorModel = require("../models/vendorModel");

exports.getVendorProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const vendor = await vendorModel.getVendorByUserId(userId);
    if (!vendor) return res.status(404).json({ error: "Vendor profile not found" });
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ error: "Server error while fetching vendor profile" });
  }
};

exports.becomeVendor = async (req, res) => {
  const userId = req.user.id;
  try {
    // Check if vendor record already exists
    const existingVendor = await vendorModel.getVendorByUserId(userId);
    if (existingVendor) {
      return res.status(400).json({ error: "User is already a vendor." });
    }
    const vendorData = {
      user_id: userId,
      business_name: req.body.business_name,
      services: req.body.services,
      description: req.body.description
    };
    const vendorId = await vendorModel.createVendor(vendorData);
    res.status(201).json({ vendorId, ...vendorData });
  } catch (error) {
    console.error("Error becoming vendor:", error);
    res.status(500).json({ error: "Server error while processing vendor application" });
  }
};

exports.updateVendorProfile = async (req, res) => {
  const userId = req.user.id;
  const { business_name, services, description } = req.body;
  try {
    const updated = await vendorModel.updateVendor(userId, { business_name, services, description });
    if (!updated) {
      return res.status(404).json({ error: "Vendor profile not found" });
    }
    res.status(200).json({ message: "Vendor profile updated successfully" });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ error: "Server error while updating vendor profile" });
  }
};
