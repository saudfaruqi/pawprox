// backend/utils/helper.js
/**
 * Send a notification to a user.
 * In production, integrate with an external email/SMS service (e.g., Twilio, SendGrid).
 * @param {number} userId - ID of the user to notify.
 * @param {string} message - Notification message.
 */
exports.sendNotification = (userId, message) => {
    console.log(`Notification sent to user ${userId}: ${message}`);
    // Advanced integration can be added here.
  };
  