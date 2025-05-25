const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new meeting
router.post('/', meetingController.createMeeting);

// Get all meetings for the current user
router.get('/', meetingController.getUserMeetings);

// Get meeting by ID
router.get('/:id', meetingController.getMeetingById);

// Update meeting
router.put('/:id', meetingController.updateMeeting);

// Delete meeting
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
