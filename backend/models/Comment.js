const pool = require('../config/db');

const Comment = {
  async create({ user_id, profilePic, text, postId, parentCommentId = null }) {
    const [result] = await pool.query(
      `INSERT INTO Comments (user_id, profilePic, text, postId, parentCommentId) VALUES (?, ?, ?, ?, ?)`,
      [user_id, profilePic, text, postId, parentCommentId]
    );
    const commentId = result.insertId;
    return await this.findById(commentId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS username, u.profilePic
       FROM Comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }
};

module.exports = Comment;
