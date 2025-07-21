const vendorModel = require("../models/vendorModel");
const marketplaceModel = require("../models/marketplaceModel");

/**
 * GET /api/vendor/products
 */
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

/**
 * POST /api/vendor/products
 */
exports.createVendorProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await vendorModel.getVendorByUserId(userId);
    if (!vendor) return res.status(400).json({ error: "Vendor profile not found." });
    if (vendor.approval_status !== 'approved') {
      return res.status(403).json({ error: "Your vendor account is not approved to post products." });
    }

    const {
      title, description, details, price, category,
      stock, sku, dimensions, weight, materials,
      tax, shippingCost, features, benefits
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: "Title, price, and category are required." });
    }

    // Format defaults
    const prodDescription = description?.trim() || "No description available.";
    const prodDetails     = details?.trim()     || "No details available.";
    const prodStock       = stock !== undefined ? parseInt(stock, 10) : 0;
    const prodSku         = sku?.trim()         || 'N/A';
    const prodDimensions  = dimensions?.trim()  || 'N/A';
    const prodWeight      = weight?.trim()      || 'N/A';
    const prodMaterials   = materials?.trim()   || 'N/A';
    const prodTax         = tax ? Number(tax)   : 0;
    const prodShipping    = shippingCost ? Number(shippingCost) : 0;

    // File fields via upload.fields()
    const image = req.files?.image?.[0]?.path || null;
    let detailImages = null;
    if (req.files?.detail_images) {
      detailImages = req.files.detail_images.map(f => f.path);
    }

    const productData = {
      vendor_id:      vendor.id,
      user_id:        userId,
      title,
      description:    prodDescription,
      details:        prodDetails,
      price,
      category,
      stock:          prodStock,
      image,
      detail_images:  detailImages ? JSON.stringify(detailImages) : null,
      sku:            prodSku,
      dimensions:     prodDimensions,
      weight:         prodWeight,
      materials:      prodMaterials,
      tax:            prodTax,
      shipping_cost:  prodShipping,
      features,
      benefits,
      rating:         0
    };

    const productId = await marketplaceModel.createProduct(productData);
    return res.status(201).json({ message: 'Product created successfully', productId, productData });
  } catch (error) {
    console.error("Error creating vendor product:", error);
    res.status(500).json({ error: "Server error while creating product" });
  }
};

/**
 * PUT /api/vendor/products/:id
 */
exports.updateVendorProduct = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = req.params.id;
    const existing  = await marketplaceModel.getItemById(productId);
    if (!existing) return res.status(404).json({ error: "Product not found." });
    if (existing.user_id !== userId) return res.status(403).json({ error: "Unauthorized." });

    const {
      title, description, details, price, category,
      stock, sku, dimensions, weight, materials,
      tax, shippingCost, features, benefits
    } = req.body;

    const prodDescription = description?.trim() || existing.description;
    const prodDetails     = details?.trim()     || existing.details;
    const prodTax         = tax !== undefined ? Number(tax) : existing.tax;
    const prodShipping    = shippingCost !== undefined ? Number(shippingCost) : existing.shipping_cost;

    const newImage      = req.files?.image?.[0]?.path;
    const newDetailImgs = req.files?.detail_images
      ? JSON.stringify(req.files.detail_images.map(f => f.path))
      : existing.detail_images;

    const updatedData = {
      title:          title          || existing.title,
      description:    prodDescription,
      details:        prodDetails,
      price:          price          || existing.price,
      category:       category       || existing.category,
      stock:          stock !== undefined ? parseInt(stock, 10) : existing.stock,
      image:          newImage !== undefined ? newImage : existing.image,
      detail_images:  newDetailImgs,
      sku:            sku?.trim()     || existing.sku,
      dimensions:     dimensions?.trim() || existing.dimensions,
      weight:         weight?.trim()  || existing.weight,
      materials:      materials?.trim() || existing.materials,
      tax:            prodTax,
      shipping_cost:  prodShipping,
      features:       features       || existing.features,
      benefits:       benefits       || existing.benefits
    };

    const affected = await marketplaceModel.updateProduct(productId, updatedData, userId);
    if (!affected) return res.status(404).json({ error: "Update failed or not authorized." });

    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error while updating product" });
  }
};

/**
 * DELETE /api/vendor/products/:id
 */
exports.deleteVendorProduct = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = req.params.id;
    const deleted   = await marketplaceModel.deleteProduct(productId, userId);
    if (!deleted) return res.status(404).json({ error: "Product not found or unauthorized." });
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};
