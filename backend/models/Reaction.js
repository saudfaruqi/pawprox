const pool = require('../config/db');

const Reaction = {
  async findOne({ postId, userId }) {
    const [rows] = await pool.query(
      'SELECT * FROM PostReactions WHERE postId = ? AND userId = ?',
      [postId, userId]
    );
    return rows[0];
  },

  async create({ postId, userId, type }) {
    await pool.query(
      'INSERT INTO PostReactions (postId, userId, type) VALUES (?, ?, ?)',
      [postId, userId, type]
    );
  },

  async update({ postId, userId, type }) {
    await pool.query(
      'UPDATE PostReactions SET type = ? WHERE postId = ? AND userId = ?',
      [type, postId, userId]
    );
  }
};

module.exports = Reaction;
