


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
    // 1️⃣ Fetch any existing vendor record for this user
    const existingVendor = await vendorModel.getVendorByUserId(userId);

    if (existingVendor) {
      // 2️⃣ If they’re still pending or already approved, block them
      if (existingVendor.approval_status === "pending" ||
          existingVendor.approval_status === "approved") {
        return res.status(400).json({ error: "You cannot reapply at this time." });
      }

      // 3️⃣ If they were rejected, update their application back to pending
      const updatedData = {
        business_name:   req.body.business_name,
        services:        req.body.services,
        description:     req.body.description,
        approval_status: "pending"
      };
      await vendorModel.updateVendorById(existingVendor.id, updatedData);

      // 4️⃣ Return 200 OK with the updated record
      return res.status(200).json({
        vendorId: existingVendor.id,
        ...updatedData
      });
    }

    // 5️⃣ No record exists at all → create a new vendor application
    const vendorData = {
      user_id:         userId,
      business_name:   req.body.business_name,
      services:        req.body.services,
      description:     req.body.description,
      approval_status: "pending"
    };
    const vendorId = await vendorModel.createVendor(vendorData);
    return res.status(201).json({ vendorId, ...vendorData });
    
  } catch (error) {
    console.error("Error processing vendor application:", error);
    return res.status(500).json({ error: "Server error while processing vendor application" });
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


