// models/petModel.js

const db = require('../config/db');

exports.createPet = async (petData) => {
  const { 
    user_id, name, type, breed, age, sex, weight, color, 
    health_status, vaccinations, allergies, lost_status, microchipped, photo 
  } = petData;
  try {
    const [result] = await db.query(
      `INSERT INTO pets 
       (user_id, name, type, breed, age, sex, weight, color, health_status, vaccinations, allergies, lost_status, microchipped, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, type, breed, age, sex, weight, color, health_status, vaccinations, allergies, lost_status, microchipped, photo]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Error creating pet: ' + error.message);
  }
};

exports.getPetsByUser = async (user_id) => {
  try {
    const [rows] = await db.query('SELECT * FROM pets WHERE user_id = ?', [user_id]);
    // Parse vaccinations for each pet if it's a JSON string
    const pets = rows.map(pet => {
      if (pet.vaccinations) {
        try {
          pet.vaccinations = JSON.parse(pet.vaccinations);
        } catch (error) {
          // Fallback: If it's not valid JSON, you could split on commas (if that's your format)
          pet.vaccinations = pet.vaccinations.split(',').map(v => v.trim());
        }
      } else {
        pet.vaccinations = [];
      }
      return pet;
    });
    return pets;
  } catch (error) {
    throw new Error('Error fetching pets: ' + error.message);
  }
};


exports.getPetById = async (petId) => {
  try {
    const [rows] = await db.query('SELECT * FROM pets WHERE id = ?', [petId]);
    return rows[0];
  } catch (error) {
    throw new Error('Error fetching pet by ID: ' + error.message);
  }
};

exports.updatePet = async (petId, petData) => {
  let { 
    name, type, breed, age, sex, weight, color, 
    health_status, vaccinations, allergies, lost_status, microchipped, photo 
  } = petData;

  // Convert vaccinations to a string if it's an array
  if (Array.isArray(vaccinations)) {
    vaccinations = Array.isArray(vaccinations) ? vaccinations.join(', ') : vaccinations;
  }
  
  try {
    await db.query(
      `UPDATE pets 
       SET name = ?, type = ?, breed = ?, age = ?, sex = ?, weight = ?, color = ?, 
           health_status = ?, vaccinations = ?, allergies = ?, lost_status = ?, microchipped = ?, photo = ?
       WHERE id = ?`,
      [name, type, breed, age, sex, weight, color, health_status, vaccinations, allergies, lost_status, microchipped, photo, petId]
    );
  } catch (error) {
    throw new Error('Error updating pet: ' + error.message);
  }
};


exports.deletePet = async (petId) => {
  try {
    await db.query('DELETE FROM pets WHERE id = ?', [petId]);
  } catch (error) {
    throw new Error('Error deleting pet: ' + error.message);
  }
};
