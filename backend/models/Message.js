const db = require('../config/db');

const Message = {
  async create({ sender_id, receiver_id, text, timestamp, reply_to = null }) {
    const [result] = await db.query(
      `INSERT INTO Messages (sender_id, receiver_id, text, timestamp, reply_to) VALUES (?, ?, ?, ?, ?)`,
      [sender_id, receiver_id, text, timestamp, reply_to]
    );
    return await this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, u.name AS username, u.profilePic
       FROM Messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  },

  async getConversation(sender_id, receiver_id) {
    const [rows] = await db.query(
      `SELECT m.*, u.name AS username, u.profilePic
       FROM Messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.timestamp ASC`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    return rows;
  },

  async toggleLikeMessage(messageId, userId) {
    // Check if the user has already liked the message
    const [rows] = await db.query(
      `SELECT * FROM MessageLikes WHERE message_id = ? AND user_id = ?`,
      [messageId, userId]
    );
    if (rows.length > 0) {
      // User already liked: remove the like record and decrement like count
      await db.query(
        `DELETE FROM MessageLikes WHERE message_id = ? AND user_id = ?`,
        [messageId, userId]
      );
      await db.query(
        `UPDATE Messages SET likes = likes - 1 WHERE id = ? AND likes > 0`,
        [messageId]
      );
    } else {
      // Add a like: insert a record and increment like count
      await db.query(
        `INSERT INTO MessageLikes (message_id, user_id) VALUES (?, ?)`,
        [messageId, userId]
      );
      await db.query(
        `UPDATE Messages SET likes = likes + 1 WHERE id = ?`,
        [messageId]
      );
    }
    return await this.findById(messageId);
  },

  async deleteMessage(id) {
    await db.query(`DELETE FROM Messages WHERE id = ?`, [id]);
    return;
  },

  async deleteConversation(sender_id, receiver_id) {
    await db.query(
      `DELETE FROM Messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    return { message: 'Conversation deleted successfully.' };
  }
};

module.exports = Message;
