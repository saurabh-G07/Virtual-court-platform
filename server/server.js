const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const db = require('./config/db.config');
const { setupSocketHandlers } = require('./websocket/socketHandlers');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// Database connection
db.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return db.sync();
  })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
