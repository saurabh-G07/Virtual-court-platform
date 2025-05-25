const crypto = require('crypto');

// Generate a random room ID
exports.generateRoomId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000).toString();
  return `${timestamp}_${random}`;
};

// Format date for display
exports.formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// Generate a random string
exports.generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex');
};
