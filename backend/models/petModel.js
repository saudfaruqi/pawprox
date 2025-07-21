const db = require('../config/db');

/**
 * Create a new pet record, ensuring array fields are serialized to strings.
 */
exports.createPet = async (petData) => {
  let {
    user_id, name, type, breed, age, sex, weight, color,
    health_status, vaccinations, allergies,
    lost_status, microchipped, photo
  } = petData;

  // Force arrays into JSON strings so mysql2 won't flatten them
  if (Array.isArray(vaccinations))   vaccinations = JSON.stringify(vaccinations);
  if (Array.isArray(allergies))      allergies   = JSON.stringify(allergies);

  const [result] = await db.query(
    `INSERT INTO pets
     (user_id,name,type,breed,age,sex,weight,color,
      health_status,vaccinations,allergies,
      lost_status,microchipped,photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ user_id, name, type, breed, age, sex, weight, color,
      health_status, vaccinations, allergies,
      lost_status, microchipped, photo ]
  );
  return result.insertId;
};

/**
 * Fetch pets for a given user, parsing JSON strings back into arrays.
 */
exports.getPetsByUser = async (user_id) => {
  try {
    const [rows] = await db.query('SELECT * FROM pets WHERE user_id = ?', [user_id]);
    return rows.map((pet) => {
      try {
        pet.vaccinations = pet.vaccinations ? JSON.parse(pet.vaccinations) : [];
      } catch {
        pet.vaccinations = pet.vaccinations
          ? pet.vaccinations.split(',').map((v) => v.trim())
          : [];
      }
      try {
        pet.allergies = pet.allergies ? JSON.parse(pet.allergies) : [];
      } catch {
        pet.allergies = pet.allergies
          ? pet.allergies.split(',').map((a) => a.trim())
          : [];
      }
      return pet;
    });
  } catch (error) {
    throw new Error('Error fetching pets: ' + error.message);
  }
};

/**
 * Fetch a single pet by ID.
 */
exports.getPetById = async (petId) => {
  try {
    const [rows] = await db.query('SELECT * FROM pets WHERE id = ?', [petId]);
    return rows[0];
  } catch (error) {
    throw new Error('Error fetching pet by ID: ' + error.message);
  }
};

/**
 * Update an existing pet record.
 */
exports.updatePet = async (petId, petData) => {
  let {
    name,
    type,
    breed,
    age,
    sex,
    weight,
    color,
    health_status,
    vaccinations,
    allergies,
    lost_status,
    microchipped,
    photo,
  } = petData;

  // Serialize arrays on update
  if (Array.isArray(vaccinations)) {
    vaccinations = JSON.stringify(vaccinations);
  }
  if (Array.isArray(allergies)) {
    allergies = JSON.stringify(allergies);
  }

  try {
    await db.query(
      `UPDATE pets
       SET name = ?, type = ?, breed = ?, age = ?, sex = ?, weight = ?, color = ?,
           health_status = ?, vaccinations = ?, allergies = ?, lost_status = ?, microchipped = ?, photo = ?
       WHERE id = ?`,
      [
        name,
        type,
        breed,
        age,
        sex,
        weight,
        color,
        health_status,
        vaccinations,
        allergies,
        lost_status,
        microchipped,
        photo,
        petId,
      ]
    );
  } catch (error) {
    throw new Error('Error updating pet: ' + error.message);
  }
};

/**
 * Delete a pet by ID.
 */
exports.deletePet = async (petId) => {
  try {
    await db.query('DELETE FROM pets WHERE id = ?', [petId]);
  } catch (error) {
    throw new Error('Error deleting pet: ' + error.message);
  }
};
