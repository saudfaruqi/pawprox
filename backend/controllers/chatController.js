const Message = require('../models/Message');

exports.getConversation = async (req, res) => {
  try {
    // Use the authenticated user's id as the sender_id
    const sender_id = req.user.id;
    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver id is required' });
    }
    const messages = await Message.getConversation(sender_id, receiver_id);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createMessageSocket = async (messageData) => {
  // Add timestamp; also accept an optional reply_to field
  messageData.timestamp = new Date();
  const newMessage = await Message.create(messageData);
  return newMessage;
};

exports.likeMessageSocket = async (messageId, userId) => {
  // Toggle like status: add if not liked, remove if already liked
  const updatedMessage = await Message.toggleLikeMessage(messageId, userId);
  return updatedMessage;
};

exports.deleteMessageSocket = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }
  // Only the sender is allowed to delete their message
  if (String(message.sender_id) !== String(userId)) {
    throw new Error("Unauthorized: Cannot delete another user's message");
  }
  await Message.deleteMessage(messageId);
  return messageId;
};

// Existing endpoint to delete a full conversation remains unchanged.
exports.deleteConversation = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver id is required' });
    }
    const result = await Message.deleteConversation(sender_id, receiver_id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
