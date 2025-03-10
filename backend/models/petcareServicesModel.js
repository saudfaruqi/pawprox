// backend/models/petcareServicesModel.js
const db = require('../config/db');

/**
 * Retrieve all pet care services ordered by creation date (latest first).
 */
exports.getServices = async () => {
  try {
    const [services] = await db.query(
      "SELECT * FROM petcare_services ORDER BY created_at DESC"
    );
    return services;
  } catch (error) {
    throw new Error("Error fetching pet care services: " + error.message);
  }
};

/**
 * Retrieve a pet care service by its ID.
 * @param {number} id
 */
exports.getServiceById = async (id) => {
  try {
    const [services] = await db.query(
      "SELECT * FROM petcare_services WHERE id = ?",
      [id]
    );
    return services[0];
  } catch (error) {
    throw new Error("Error fetching pet care service: " + error.message);
  }
};

/**
 * Create a new pet care service.
 * @param {Object} serviceData - Contains name, description, price, availability, features.
 * @returns {number} - The ID of the newly created service.
 */
exports.createService = async (serviceData) => {
  const { name, description, price, availability, features } = serviceData;
  try {
    const [result] = await db.query(
      `INSERT INTO petcare_services (name, description, price, availability, features)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, availability, JSON.stringify(features)]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating pet care service: " + error.message);
  }
};

/**
 * Update an existing pet care service.
 * @param {number} id
 * @param {Object} serviceData - Contains updated fields.
 * @returns {number} - The number of affected rows.
 */
exports.updateService = async (id, serviceData) => {
  const { name, description, price, availability, features } = serviceData;
  try {
    const [result] = await db.query(
      `UPDATE petcare_services 
       SET name = ?, description = ?, price = ?, availability = ?, features = ?
       WHERE id = ?`,
      [name, description, price, availability, JSON.stringify(features), id]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error updating pet care service: " + error.message);
  }
};

/**
 * Delete a pet care service by its ID.
 * @param {number} id
 * @returns {number} - The number of affected rows.
 */
exports.deleteService = async (id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM petcare_services WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error deleting pet care service: " + error.message);
  }
};
