const pool = require('../config/db');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');

// GET /api/posts?page=1&limit=5
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Pass the current user id (if available) to include their reaction
    const currentUserId = req.user ? req.user.id : null;
    const posts = await Post.findPaginated(page, limit, currentUserId);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const user_id = req.user.id;
    const profilePic = req.user.profilePic || '';
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const post = await Post.create({ user_id, profilePic, content, image: imageUrl });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/posts/:id/react
exports.addReaction = async (req, res) => {
  try {
    const { id } = req.params; // Post id
    const { type } = req.body;
    if (!['like', 'love', 'haha'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    const userId = req.user.id;
    const existingReaction = await Reaction.findOne({ postId: id, userId });
    if (existingReaction) {
      if (existingReaction.type === type) {
        // No change if same reaction; alternatively, you could allow toggling off
      } else {
        await Reaction.update({ postId: id, userId, type });
      }
    } else {
      await Reaction.create({ postId: id, userId, type });
    }
    await updatePostReactionCounts(id);
    const updatedPost = await Post.findById(id, userId);
    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating reaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // Post id
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    const user_id = req.user.id;
    const profilePic = req.user.profilePic || '';
    // Create top-level comment (no parent)
    await Comment.create({ user_id, profilePic, text, postId: id, parentCommentId: null });
    const updatedPost = await Post.findById(id, req.user.id);
    res.json(updatedPost);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/posts/:id/comments/:commentId/reply
exports.addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params; // id = post id, commentId = parent comment id
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }
    const user_id = req.user.id;
    const profilePic = req.user.profilePic || '';
    // Create a comment with parentCommentId set to commentId
    await Comment.create({ user_id, profilePic, text, postId: id, parentCommentId: commentId });
    const updatedPost = await Post.findById(id, req.user.id);
    res.json(updatedPost);
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to update reaction counts on a post
const updatePostReactionCounts = async (postId) => {
  const [rows] = await pool.query(
    'SELECT type, COUNT(*) as count FROM PostReactions WHERE postId = ? GROUP BY type',
    [postId]
  );
  const counts = { like: 0, love: 0, haha: 0 };
  rows.forEach(row => {
    counts[row.type] = row.count;
  });
  await pool.query(
    'UPDATE Posts SET `like` = ?, `love` = ?, `haha` = ? WHERE id = ?',
    [counts.like, counts.love, counts.haha, postId]
  );
};


// Edit a post – only allowed if the current user is the post owner
exports.editPost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { content } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own post" });
    }
    await pool.query("UPDATE Posts SET content = ? WHERE id = ?", [content, id]);
    const updatedPost = await Post.findById(id, req.user.id);
    res.json(updatedPost);
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a post – only allowed if the current user is the post owner
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own post" });
    }
    await pool.query("DELETE FROM Posts WHERE id = ?", [id]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit a comment – only allowed if the current user is the comment owner
exports.editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own comment" });
    }
    await pool.query("UPDATE Comments SET text = ? WHERE id = ?", [text, commentId]);
    const updatedPost = await Post.findById(postId, req.user.id);
    res.json(updatedPost);
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a comment – only allowed if the current user is the comment owner
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own comment" });
    }
    await pool.query("DELETE FROM Comments WHERE id = ?", [commentId]);
    const updatedPost = await Post.findById(postId, req.user.id);
    res.json(updatedPost);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Server error" });
  }
};