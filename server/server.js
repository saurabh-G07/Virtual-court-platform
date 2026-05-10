const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const db = require('./config/db.config');
const { setupSocketHandlers } = require('./websocket/socketHandlers');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000'
].filter(Boolean).map(o => o.startsWith('http') ? o : `https://${o}`);

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
    // Require models to ensure they are registered before sync
    require('./models/user.model');
    require('./models/meeting.model');
    require('./models/message.model');
    require('./models/evidence.model');
    require('./models/auditLog.model');
    
    return db.sync({ alter: true });
  })
  .then(() => {
    console.log('DATABASE SYNC SUCCESS: All tables are ready.');
  })
  .catch(err => {
    console.error('DATABASE CRITICAL ERROR:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    process.exit(1); // Force Render to show the failure in logs
  });

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Restart trigger for JWT_SECRET
