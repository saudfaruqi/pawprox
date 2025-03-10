


const marketplaceModel = require('../models/marketplaceModel');

/**
 * POST /api/marketplace
 * List a new marketplace item.
 */
exports.listItem = async (req, res) => {
  // Now extract tax and shipping_cost from req.body
  const { title, description, price, category, image, tax, shipping_cost } = req.body;
  if (!title || !description || price == null || !category) {
    return res.status(400).json({ error: "Title, description, price, and category are required" });
  }
  // Get user id from authenticated user (set by auth middleware)
  const user_id = req.user.id;

  try {
    // Pass tax and shipping_cost to the model.
    const itemId = await marketplaceModel.listItem({
      user_id,
      title,
      description,
      price,
      category,
      image,
      tax,           // New field
      shipping_cost  // New field
    });
    return res.status(201).json({ message: "Marketplace item listed successfully", itemId });
  } catch (error) {
    console.error("Marketplace listing error:", error);
    return res.status(500).json({ error: "Server error while listing item" });
  }
};

/**
 * GET /api/marketplace
 * Retrieve all marketplace items.
 */
exports.getItems = async (req, res) => {
  try {
    const items = await marketplaceModel.getItems();
    return res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    return res.status(500).json({ error: "Server error while fetching items" });
  }
};

/**
 * GET /api/marketplace/:id
 * Retrieve a single marketplace item by its ID.
 */
exports.getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await marketplaceModel.getItemById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return res.status(500).json({ error: "Server error while fetching item" });
  }
};
