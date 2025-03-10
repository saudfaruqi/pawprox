const pool = require('../config/db');

const Post = {
  async create({ user_id, profilePic, content, image }) {
    const [result] = await pool.query(
      `INSERT INTO Posts (user_id, profilePic, content, image) VALUES (?, ?, ?, ?)`,
      [user_id, profilePic, content, image]
    );
    const postId = result.insertId;
    return await this.findById(postId);
  },

  async findById(id, currentUserId = null) {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS username, u.profilePic 
       FROM Posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const post = rows[0];
    post.reactions = {
      like: post.like,
      love: post.love,
      haha: post.haha
    };

    // Fetch all comments for this post
    const [commentsRows] = await pool.query(
      `SELECT c.*, u.name AS username, u.profilePic 
       FROM Comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.postId = ?
       ORDER BY c.timestamp ASC`,
      [id]
    );
    // Nest comments based on parentCommentId
    post.comments = nestComments(commentsRows);
    
    if (currentUserId) {
      const [reactionRows] = await pool.query(
        'SELECT type FROM PostReactions WHERE postId = ? AND userId = ?',
        [id, currentUserId]
      );
      post.currentUserReaction = reactionRows[0] ? reactionRows[0].type : null;
    } else {
      post.currentUserReaction = null;
    }
    
    return post;
  },

  async findPaginated(page, limit, currentUserId = null) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS username, u.profilePic 
       FROM Posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.timestamp DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    for (const post of rows) {
      post.reactions = {
        like: post.like,
        love: post.love,
        haha: post.haha
      };
      const [commentsRows] = await pool.query(
        `SELECT c.*, u.name AS username, u.profilePic 
         FROM Comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.postId = ?
         ORDER BY c.timestamp ASC`,
        [post.id]
      );
      post.comments = nestComments(commentsRows);
      if (currentUserId) {
        const [reactionRows] = await pool.query(
          'SELECT type FROM PostReactions WHERE postId = ? AND userId = ?',
          [post.id, currentUserId]
        );
        post.currentUserReaction = reactionRows[0] ? reactionRows[0].type : null;
      } else {
        post.currentUserReaction = null;
      }
    }
    return rows;
  }
};

// Helper function to nest comments based on parentCommentId
const nestComments = (comments) => {
  const map = {};
  const roots = [];
  comments.forEach(comment => {
    comment.replies = [];
    map[comment.id] = comment;
  });
  comments.forEach(comment => {
    if (comment.parentCommentId) {
      if (map[comment.parentCommentId]) {
        map[comment.parentCommentId].replies.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });
  return roots;
};

module.exports = Post;
