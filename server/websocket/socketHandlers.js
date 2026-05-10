const { saveMessage } = require('../services/chat.service');
const { updateMeetingStatus } = require('../services/meeting.service');

exports.setupSocketHandlers = (io) => {
  const connectedUsers = new Map();
  
  const streamNamespace = io.of('/stream');
  
  streamNamespace.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join a room
    socket.on('join-room', async (data) => {
      const { roomId, userId, userName, role } = data;
      
      // Join the room
      socket.join(roomId);
      
      // Store user info
      connectedUsers.set(socket.id, {
        userId,
        userName,
        role,
        roomId
      });
      
      // Update meeting status to ongoing if it's the first user
      const roomClients = await streamNamespace.in(roomId).fetchSockets();
      if (roomClients.length === 1) {
        await updateMeetingStatus(roomId, 'ongoing');
      }
      
      // Notify others in the room
      socket.to(roomId).emit('user-connected', {
        socketId: socket.id,
        userId,
        userName,
        role
      });
      
      // Send list of connected users to the new user
      const usersInRoom = [];
      for (const [id, user] of connectedUsers.entries()) {
        if (user.roomId === roomId && id !== socket.id) {
          usersInRoom.push({
            socketId: id,
            userId: user.userId,
            userName: user.userName,
            role: user.role
          });
        }
      }
      socket.emit('room-users', usersInRoom);
    });
    
    // Handle WebRTC signaling
    socket.on('signal', (data) => {
      const { to, signal } = data;
      socket.to(to).emit('signal', {
        from: socket.id,
        signal
      });
    });

    // Evidence sync
    socket.on('present-evidence', (data) => {
      const { roomId, evidence } = data;
      streamNamespace.to(roomId).emit('evidence-presented', evidence);
    });

    // Waiting Room logic
    socket.on('request-join', (data) => {
      const { roomId, userId, userName, role } = data;
      streamNamespace.to(roomId).emit('join-request', { socketId: socket.id, userId, userName, role });
    });

    socket.on('admit-user', (data) => {
      const { socketId } = data;
      streamNamespace.to(socketId).emit('admitted');
    });
    
    // Handle chat messages
    socket.on('chat-message', async (data) => {
      const { roomId, message, sender } = data;
      const timestamp = new Date();
      
      // Save message to database
      await saveMessage({
        roomId,
        senderId: sender.userId,
        senderName: sender.userName,
        message,
        timestamp
      });
      
      // Broadcast to all users in the room
      streamNamespace.to(roomId).emit('chat-message', {
        sender,
        message,
        timestamp
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        const { roomId, userId, userName } = user;
        
        // Notify others in the room
        socket.to(roomId).emit('user-disconnected', {
          socketId: socket.id,
          userId,
          userName
        });
        
        // Remove user from connected users
        connectedUsers.delete(socket.id);
        
        // Update meeting status to completed if no users left
        const roomClients = await streamNamespace.in(roomId).fetchSockets();
        if (roomClients.length === 0) {
          await updateMeetingStatus(roomId, 'completed');
          
          try {
            // Trigger AI Summarization via Grok
            const grokService = require('../services/grok.service');
            const Message = require('../models/message.model');
            const Meeting = require('../models/meeting.model');
            
            const messages = await Message.findAll({
              where: { roomId },
              order: [['timestamp', 'ASC']]
            });
            
            if (messages.length > 0) {
              const transcript = messages.map(m => `${m.senderName}: ${m.message}`).join('\n');
              const summary = await grokService.summarizeCase(transcript);
              
              await Meeting.update({ caseSummary: summary, transcriptText: transcript }, { where: { roomId } });
              console.log(`AI Summary generated for room ${roomId}`);
            }
          } catch (error) {
            console.error('Error generating AI summary:', error);
          }
        }
      }
      
      console.log('Client disconnected:', socket.id);
    });
  });
};
