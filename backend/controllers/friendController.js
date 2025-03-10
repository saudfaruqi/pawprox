const FriendRequest = require('../models/FriendRequest');

exports.sendRequest = async (req, res) => {
  try {
    const { receiver_id } = req.body;
    const sender_id = req.user.id;
    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver ID is required.' });
    }
    if (sender_id === receiver_id) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }
    const areFriends = await FriendRequest.checkFriendship({ user1: sender_id, user2: receiver_id });
    if (areFriends) {
      return res.status(400).json({ error: 'You are already friends.' });
    }
    const request = await FriendRequest.sendRequest({ sender_id, receiver_id });
    res.status(201).json(request);
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkFriendship = async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user.id;
    const areFriends = await FriendRequest.checkFriendship({ user1: currentUserId, user2: user_id });
    res.json({ areFriends });
  } catch (err) {
    console.error('Error checking friendship:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const user_id = req.user.id;
    const requests = await FriendRequest.getRequestsForUser(user_id);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAcceptedFriends = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const acceptedFriends = await FriendRequest.getAcceptedFriends(currentUserId);
    res.json(acceptedFriends);
  } catch (err) {
    console.error('Error fetching accepted friends:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const receiver_id = req.user.id;
    const request = await FriendRequest.acceptRequest({ id, receiver_id });
    res.json(request);
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const friendRequest = await FriendRequest.findById(id);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }
    if (friendRequest.sender_id !== currentUserId && friendRequest.receiver_id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to delete this request.' });
    }
    await FriendRequest.deleteRequest(id);
    res.json({ message: 'Friend request deleted.' });
  } catch (err) {
    console.error('Error deleting friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// New controller endpoint to remove a friend
exports.removeFriend = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friend_id } = req.params;
    // Verify that the users are currently friends
    const areFriends = await FriendRequest.checkFriendship({ user1: currentUserId, user2: friend_id });
    if (!areFriends) {
      return res.status(400).json({ error: 'You are not friends with this user.' });
    }
    const result = await FriendRequest.removeFriend({ user1: currentUserId, user2: friend_id });
    res.json(result);
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
