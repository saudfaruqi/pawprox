



const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Get the authenticated user's profile.
 */
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, profilePic FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0)
      return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Server error while fetching user profile' });
  }
};


/**
 * Get a list of users (excluding the current user) based on a search query.
 */
exports.getUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const currentUserId = req.user.id;
    if (!search.trim()) {
      return res.json([]);
    }
    const [rows] = await db.query(
      "SELECT id, name AS username, profilePic FROM users WHERE name LIKE ? AND id <> ?",
      [`%${search}%`, currentUserId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * Update the authenticated user's profile.
 */
exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email are required' });
  
  // If a file is uploaded, use its path as the profilePic.
  const profilePic = req.file ? req.file.path : null;

  try {
    if (profilePic) {
      await db.query('UPDATE users SET name = ?, email = ?, profilePic = ? WHERE id = ?', [
        name,
        email,
        profilePic,
        userId,
      ]);
    } else {
      await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [
        name,
        email,
        userId,
      ]);
    }
    // Optionally, fetch and return the updated user record.
    const [updatedUsers] = await db.query(
      'SELECT id, name, email, role, profilePic FROM users WHERE id = ?',
      [userId]
    );
    return res.status(200).json({ user: updatedUsers[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error while updating profile' });
  }
};



/**
 * Update the authenticated user's password.
 */
exports.updateUserPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }
  try {
    // Fetch the user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if current password is correct
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    
    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Server error while updating password' });
  }
};

/**
 * Update user preferences (as an example).
 */
exports.updateUserPreferences = async (req, res) => {
  const userId = req.user.id;
  // Assume preferences are sent in req.body.preferences as a JSON object
  const { preferences } = req.body;
  try {
    // You can store preferences in a JSON column or a separate table.
    await db.query('UPDATE users SET preferences = ? WHERE id = ?', [JSON.stringify(preferences), userId]);
    return res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ error: 'Server error while updating preferences' });
  }
};


exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  try {
    // Fetch the user by ID
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];

    // Verify the provided password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete the user account from the database
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Server error while deleting account' });
  }
};