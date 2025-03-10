

//marketplacemodel

const db = require('../config/db');

exports.createProduct = async (productData) => {
  const { 
    vendor_id, 
    user_id, 
    title, 
    description, 
    details, 
    price, 
    category, 
    stock, 
    image, 
    detail_images, 
    sku, 
    dimensions, 
    weight, 
    materials, 
    tax, 
    shipping_cost, 
    features,    // New field
    benefits,    // New field
    rating 
  } = productData;

  const query = `
    INSERT INTO marketplace 
      (vendor_id, user_id, title, description, details, price, category, stock, image, detail_images, sku, dimensions, weight, materials, tax, shipping_cost, features, benefits, rating)
    VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    vendor_id,
    user_id,
    title,
    description,
    details,
    price,
    category,
    stock,
    image,
    detail_images,
    sku,
    dimensions,
    weight,
    materials,
    tax,
    shipping_cost,
    features,   // New value
    benefits,   // New value
    rating
  ];
  const [result] = await db.query(query, params);
  return result.insertId;
};



exports.getItems = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM marketplace ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    throw new Error("Error fetching marketplace items: " + error.message);
  }
};

exports.getItemById = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM marketplace WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw new Error("Error fetching marketplace item: " + error.message);
  }
};

exports.getProductsByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM marketplace WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching vendor products: " + error.message);
  }
};

exports.listItem = async (itemData) => {
  const { user_id, title, description, price, category, image, tax, shipping_cost } = itemData;
  const query = `
    INSERT INTO marketplace 
      (user_id, title, description, price, category, image, tax, shipping_cost)
    VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    user_id,
    title,
    description,
    price,
    category,
    image,
    tax ? Number(tax) : 0,
    shipping_cost ? Number(shipping_cost) : 0
  ];
  const [result] = await db.query(query, params);
  return result.insertId;
};

exports.updateProduct = async (productId, productData, vendorId) => {
  const { title, description, details, price, category, stock, image, sku, dimensions, weight, materials, tax, shipping_cost, features, benefits, detail_images } = productData;
  try {
    let query;
    let params;
    
    if (typeof image === 'undefined') {
      // Update without changing the main image.
      query = `
        UPDATE marketplace 
        SET title = ?, description = ?, details = ?, price = ?, category = ?, stock = ?, 
            sku = ?, dimensions = ?, weight = ?, materials = ?, detail_images = ?, tax = ?, shipping_cost = ?, features = ?, benefits = ?
        WHERE id = ? AND user_id = ?`;
      params = [title, description, details, price, category, stock, sku, dimensions, weight, materials, detail_images, tax, shipping_cost, features, benefits, productId, vendorId];
    } else {
      // Update including a new main image.
      query = `
        UPDATE marketplace 
        SET title = ?, description = ?, details = ?, price = ?, category = ?, stock = ?, image = ?,
            sku = ?, dimensions = ?, weight = ?, materials = ?, detail_images = ?, tax = ?, shipping_cost = ?, features = ?, benefits = ?
        WHERE id = ? AND user_id = ?`;
      params = [title, description, details, price, category, stock, image, sku, dimensions, weight, materials, detail_images, tax, shipping_cost, features, benefits, productId, vendorId];
    }
    
    const [result] = await db.query(query, params);
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error updating product: " + error.message);
  }
};



exports.deleteProduct = async (productId, vendorId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM marketplace WHERE id = ? AND user_id = ?",
      [productId, vendorId]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};
