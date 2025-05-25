// server/config/socket.config.js

const socketIo = require('socket.io');

/**
 * Configure and initialize Socket.IO with the HTTP server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Configured Socket.IO instance
 */
const configureSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Create a namespace for video streaming
  const streamNamespace = io.of('/stream');

  // Store connected users
  const connectedUsers = new Map();
  
  // Log socket connections and disconnections
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return {
    io,
    streamNamespace,
    connectedUsers
  };
};

module.exports = configureSocket;
