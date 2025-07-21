



const db = require('../config/db');

/**
 * Create a new user record.
 * @param {Object} userData - Contains name, email, password, role.
 * @returns {number} - The ID of the newly created user.
 */
exports.createUser = async (userData) => {
  const { name, email, password, role, phone } = userData;
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, phone]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

/**
 * Find a user by email.
 */
exports.findUserByEmail = async (email) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    return users[0];
  } catch (error) {
    throw new Error('Error finding user by email: ' + error.message);
  }
};

/**
 * Find a user by ID.
 */
exports.findUserById = async (id) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  } catch (error) {
    throw new Error('Error finding user by ID: ' + error.message);
  }
};
