const { Message } = require('../models/message.model');

// Save chat message to database
exports.saveMessage = async (messageData) => {
  try {
    const { roomId, senderId, senderName, message, timestamp } = messageData;
    
    const savedMessage = await Message.create({
      roomId,
      senderId,
      senderName,
      message,
      timestamp
    });
    
    return savedMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Get chat history for a room
exports.getChatHistory = async (roomId) => {
  try {
    const messages = await Message.findAll({
      where: { roomId },
      order: [['timestamp', 'ASC']]
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};
