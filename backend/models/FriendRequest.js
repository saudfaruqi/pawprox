const db = require('../config/db');

const FriendRequest = {
  async sendRequest({ sender_id, receiver_id }) {
    const [result] = await db.query(
      `INSERT INTO FriendRequests (sender_id, receiver_id) VALUES (?, ?)`,
      [sender_id, receiver_id]
    );
    return await this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM FriendRequests WHERE id = ?`, [id]);
    return rows[0];
  },

  async getRequestsForUser(user_id) {
    const [rows] = await db.query(
      `SELECT fr.*, u.name AS senderName, u.profilePic AS senderPic
       FROM FriendRequests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [user_id]
    );
    return rows;
  },

  async acceptRequest({ id, receiver_id }) {
    await db.query(
      `UPDATE FriendRequests SET status = 'accepted' WHERE id = ? AND receiver_id = ?`,
      [id, receiver_id]
    );
    return await this.findById(id);
  },

  async deleteRequest(id) {
    await db.query(`DELETE FROM FriendRequests WHERE id = ?`, [id]);
  },

  async checkFriendship({ user1, user2 }) {
    const [rows] = await db.query(
      `SELECT * FROM FriendRequests 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
         AND status = 'accepted'`,
      [user1, user2, user2, user1]
    );
    return rows.length > 0;
  },

  async getAcceptedFriends(user_id) {
    const [rowsSender] = await db.query(
      `SELECT u.id, u.name AS username, u.profilePic
       FROM FriendRequests fr
       JOIN users u ON fr.receiver_id = u.id
       WHERE fr.sender_id = ? AND fr.status = 'accepted'`,
      [user_id]
    );
    const [rowsReceiver] = await db.query(
      `SELECT u.id, u.name AS username, u.profilePic
       FROM FriendRequests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'accepted'`,
      [user_id]
    );
    return [...rowsSender, ...rowsReceiver];
  },

  // New method to remove an existing friend by marking the friendship as "removed"
  async removeFriend({ user1, user2 }) {
    await db.query(
      `UPDATE FriendRequests 
       SET status = 'removed' 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
         AND status = 'accepted'`,
      [user1, user2, user2, user1]
    );
    return { message: 'Friend removed successfully.' };
  }
};

module.exports = FriendRequest;
