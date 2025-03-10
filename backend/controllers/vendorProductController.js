// controllers/vendorProductController.js
const vendorModel = require("../models/vendorModel");
const marketplaceModel = require("../models/marketplaceModel");

exports.getVendorProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await marketplaceModel.getProductsByUserId(userId);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    res.status(500).json({ error: "Server error while fetching products" });
  }
};

exports.createVendorProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify vendor profile and approval status
    const vendor = await vendorModel.getVendorByUserId(userId);
    if (!vendor) {
      return res.status(400).json({ error: "Vendor profile not found. Please create a vendor profile." });
    }
    if (vendor.approval_status !== 'approved') {
      return res.status(403).json({ error: "Your vendor account is not approved to post products." });
    }
    
    // Extract product details including new fields: tax, shippingCost, features, and benefits
    let { title, description, details, price, category, stock, sku, dimensions, weight, materials, tax, shippingCost, features, benefits } = req.body;
    
    if (!title || !price || !category) {
      return res.status(400).json({ error: "Title, price, and category are required." });
    }
    
    const prodDescription = description && description.trim() ? description : "No description available.";
    const prodDetails = details && details.trim() ? details : "No details available.";
    const prodStock = stock !== undefined ? parseInt(stock) : 0;
    const prodSku = sku && sku.trim() ? sku : 'N/A';
    const prodDimensions = dimensions && dimensions.trim() ? dimensions : 'N/A';
    const prodWeight = weight && weight.trim() ? weight : 'N/A';
    const prodMaterials = materials && materials.trim() ? materials : 'N/A';
    
    // Convert tax and shippingCost to numbers
    const prodTax = tax ? Number(tax) : 0;
    const prodShippingCost = shippingCost ? Number(shippingCost) : 0;
    
    // Use main image if uploaded; otherwise, use a placeholder.
    const image = req.file ? req.file.path : 'https://via.placeholder.com/150';
    
    // Extract detail images if provided
    let detailImages = null;
    if (req.files && req.files.detail_images) {
      detailImages = req.files.detail_images.map(file => file.path);
    }
    
    // Build product data object
    const productData = {
      vendor_id: vendor.id,
      user_id: userId,
      title,
      description: prodDescription,
      details: prodDetails,
      price,
      category,
      stock: prodStock,
      image,
      detail_images: detailImages ? JSON.stringify(detailImages) : null,
      sku: prodSku,
      dimensions: prodDimensions,
      weight: prodWeight,
      materials: prodMaterials,
      tax: prodTax,
      shipping_cost: prodShippingCost,
      features,   // New field
      benefits,   // New field
      rating: 0
    };
    
    const productId = await marketplaceModel.createProduct(productData);
    res.status(201).json({ productId, ...productData });
  } catch (error) {
    console.error("Error creating vendor product:", error);
    res.status(500).json({ error: "Server error while creating product" });
  }
};



exports.updateVendorProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    
    // Retrieve the existing product
    const existingProduct = await marketplaceModel.getItemById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }
    
    // Extract fields including new fields from req.body
    let { title, description, details, price, category, stock, sku, dimensions, weight, materials, tax, shippingCost, features, benefits } = req.body;
    const image = req.file ? req.file.path : undefined;
    
    // Convert tax and shippingCost
    const prodTax = tax ? Number(tax) : 0;
    const prodShippingCost = shippingCost ? Number(shippingCost) : 0;
    
    // Process detail images
    let detailImages;
    if (req.files && req.files.detail_images) {
      detailImages = JSON.stringify(req.files.detail_images.map(file => file.path));
    } else {
      detailImages = existingProduct.detail_images;
    }
    
    // Prepare updated data object
    const updatedData = {
      title,
      description: description && description.trim() ? description : "No description available.",
      details: details && details.trim() ? details : "No details available.",
      price,
      category,
      stock,
      image,
      sku: sku && sku.trim() ? sku : 'N/A',
      dimensions: dimensions && dimensions.trim() ? dimensions : 'N/A',
      weight: weight && weight.trim() ? weight : 'N/A',
      materials: materials && materials.trim() ? materials : 'N/A',
      tax: prodTax,
      shipping_cost: prodShippingCost,
      features,   // New field
      benefits,   // New field
      detail_images: detailImages
    };
    
    const success = await marketplaceModel.updateProduct(productId, updatedData, userId);
    if (!success) {
      return res.status(404).json({ error: "Product not found or unauthorized." });
    }
    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error while updating product" });
  }
};


exports.deleteVendorProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    
    const success = await marketplaceModel.deleteProduct(productId, userId);
    if (!success) {
      return res.status(404).json({ error: "Product not found or unauthorized." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};
