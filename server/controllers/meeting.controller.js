const { Op } = require('sequelize');
const Meeting = require('../models/meeting.model');
const User = require('../models/user.model');
const { generateRoomId } = require('../utils/helpers');

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { subject, description, startTime, endTime, participants } = req.body;
    
    // Generate a unique room ID
    const roomId = generateRoomId();
    
    // Create the meeting
    const meeting = await Meeting.create({
      roomId,
      subject,
      description,
      startTime,
      endTime,
      createdBy: req.userId,
      status: 'scheduled'
    });
    
    // Add participants if provided
    if (participants && participants.length > 0) {
      const users = await User.findAll({
        where: { id: { [Op.in]: participants } }
      });
      
      await meeting.addParticipants(users);
    }
    
    // Add the creator as a participant
    const creator = await User.findByPk(req.userId);
    await meeting.addParticipant(creator);
    
    // Fetch the complete meeting with participants
    const completeMeeting = await Meeting.findByPk(meeting.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
    
    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: completeMeeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error during meeting creation' });
  }
};

// Get all meetings for the current user
exports.getUserMeetings = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    // Get meetings created by the user
    const createdMeetings = await Meeting.findAll({
      where: { createdBy: req.userId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
    
    // Get meetings where the user is a participant
    const participatingMeetings = await user.getMeetings({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
    
    // Combine and deduplicate meetings
    const allMeetings = [...createdMeetings];
    participatingMeetings.forEach(meeting => {
      if (!allMeetings.some(m => m.id === meeting.id)) {
        allMeetings.push(meeting);
      }
    });
    
    res.status(200).json({ meetings: allMeetings });
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({ message: 'Server error while fetching meetings' });
  }
};

// Get meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized to view this meeting
    const isCreator = meeting.createdBy === req.userId;
    const isParticipant = meeting.participants.some(p => p.id === req.userId);
    
    if (!isCreator && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this meeting' });
    }
    
    res.status(200).json({ meeting });
  } catch (error) {
    console.error('Get meeting by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching meeting' });
  }
};

// Update meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, startTime, endTime, status, participants } = req.body;
    
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized to update this meeting
    if (meeting.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }
    
    // Update meeting details
    await meeting.update({
      subject: subject || meeting.subject,
      description: description || meeting.description,
      startTime: startTime || meeting.startTime,
      endTime: endTime || meeting.endTime,
      status: status || meeting.status
    });
    
    // Update participants if provided
    if (participants && participants.length > 0) {
      const users = await User.findAll({
        where: { id: { [Op.in]: participants } }
      });
      
      await meeting.setParticipants(users);
      
      // Ensure creator is always a participant
      const creator = await User.findByPk(req.userId);
      await meeting.addParticipant(creator);
    }
    
    // Fetch the updated meeting
    const updatedMeeting = await Meeting.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
    
    res.status(200).json({
      message: 'Meeting updated successfully',
      meeting: updatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error during meeting update' });
  }
};

// Delete meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized to delete this meeting
    if (meeting.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }
    
    await meeting.destroy();
    
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error during meeting deletion' });
  }
};
