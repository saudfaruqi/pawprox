// backend/models/veterinarianModel.js
const db = require('../config/db');

/**
 * Retrieve all veterinarians, ordered by creation date (latest first).
 */
exports.getAllVeterinarians = async () => {
  try {
    const [vets] = await db.query(
      "SELECT * FROM veterinarians ORDER BY created_at DESC"
    );
    return vets;
  } catch (error) {
    throw new Error("Error fetching veterinarians: " + error.message);
  }
};

/**
 * Retrieve a veterinarian by ID.
 * @param {number} id - Veterinarian ID.
 */
exports.getVeterinarianById = async (id) => {
  try {
    const [vets] = await db.query(
      "SELECT * FROM veterinarians WHERE id = ?",
      [id]
    );
    return vets[0];
  } catch (error) {
    throw new Error("Error fetching veterinarian: " + error.message);
  }
};

/**
 * Create a new veterinarian record.
 * @param {Object} vetData - Contains name, specialty, experience, availability, location, rating, reviews, languages, and certifications.
 * @returns {number} - The new veterinarian ID.
 */
exports.createVeterinarian = async (vetData) => {
  const { name, specialty, experience, availability, location, rating, reviews, languages, certifications } = vetData;
  try {
    const [result] = await db.query(
      `INSERT INTO veterinarians (name, specialty, experience, availability, location, rating, reviews, languages, certifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        specialty,
        experience,
        availability,
        location,
        rating || 0,
        reviews || 0,
        JSON.stringify(languages || []),
        JSON.stringify(certifications || [])
      ]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating veterinarian: " + error.message);
  }
};

/**
 * Update an existing veterinarian record.
 * @param {number} id - Veterinarian ID.
 * @param {Object} vetData - Updated data.
 * @returns {number} - Number of affected rows.
 */
exports.updateVeterinarian = async (id, vetData) => {
  const { name, specialty, experience, availability, location, rating, reviews, languages, certifications } = vetData;
  try {
    const [result] = await db.query(
      `UPDATE veterinarians
       SET name = ?, specialty = ?, experience = ?, availability = ?, location = ?, rating = ?, reviews = ?, languages = ?, certifications = ?
       WHERE id = ?`,
      [
        name,
        specialty,
        experience,
        availability,
        location,
        rating,
        reviews,
        JSON.stringify(languages || []),
        JSON.stringify(certifications || []),
        id
      ]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error updating veterinarian: " + error.message);
  }
};

/**
 * Delete a veterinarian record.
 * @param {number} id - Veterinarian ID.
 * @returns {number} - Number of affected rows.
 */
exports.deleteVeterinarian = async (id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM veterinarians WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error deleting veterinarian: " + error.message);
  }
};
