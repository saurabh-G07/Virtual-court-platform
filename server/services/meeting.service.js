const Meeting = require('../models/meeting.model');

// Update meeting status
exports.updateMeetingStatus = async (roomId, status) => {
  try {
    const meeting = await Meeting.findOne({
      where: { roomId }
    });
    
    if (meeting) {
      await meeting.update({ status });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating meeting status:', error);
    throw error;
  }
};

// Get active meetings
exports.getActiveMeetings = async () => {
  try {
    const meetings = await Meeting.findAll({
      where: {
        status: ['scheduled', 'ongoing']
      }
    });
    
    return meetings;
  } catch (error) {
    console.error('Error getting active meetings:', error);
    throw error;
  }
};

// Check if meeting exists
exports.checkMeetingExists = async (roomId) => {
  try {
    const meeting = await Meeting.findOne({
      where: { roomId }
    });
    
    return !!meeting;
  } catch (error) {
    console.error('Error checking meeting existence:', error);
    throw error;
  }
};
