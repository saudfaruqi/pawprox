




const db = require('../config/db');

exports.getLostPets = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM lost_pets ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    throw new Error("Error fetching lost pets: " + error.message);
  }
};

exports.createLostPet = async (petData) => {
  const { user_id, petName, species, description, location, status, contactInfo, lastSeen, image } = petData;
  try {
    const [result] = await db.query(
      `INSERT INTO lost_pets 
         (user_id, petName, species, description, location, status, contactInfo, lastSeen, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, petName, species, description, location, status, contactInfo, lastSeen, image || null]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error creating lost pet alert: " + error.message);
  }
};

exports.updateLostPet = async (id, petData) => {
  const { petName, species, description, location, status, contactInfo, lastSeen, image } = petData;
  try {
    // If image is provided (even null), update it; otherwise, leave it unchanged.
    let query, params;
    if (typeof image !== 'undefined') {
      query = `UPDATE lost_pets SET petName = ?, species = ?, description = ?, location = ?, status = ?, contactInfo = ?, lastSeen = ?, image = ? WHERE id = ?`;
      params = [petName, species, description, location, status, contactInfo, lastSeen, image, id];
    } else {
      query = `UPDATE lost_pets SET petName = ?, species = ?, description = ?, location = ?, status = ?, contactInfo = ?, lastSeen = ? WHERE id = ?`;
      params = [petName, species, description, location, status, contactInfo, lastSeen, id];
    }
    const [result] = await db.query(query, params);
    return result;
  } catch (error) {
    throw new Error("Error updating lost pet alert: " + error.message);
  }
};

exports.deleteLostPet = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM lost_pets WHERE id = ?", [id]);
    return result;
  } catch (error) {
    throw new Error("Error deleting lost pet alert: " + error.message);
  }
};

exports.getLostPetById = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM lost_pets WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw new Error("Error fetching lost pet by id: " + error.message);
  }
};
