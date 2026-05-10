const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  isWaitingRoomEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  transcriptText: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  caseSummary: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define associations
Meeting.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Meeting.belongsToMany(User, { through: 'MeetingParticipants', as: 'participants' });
User.belongsToMany(Meeting, { through: 'MeetingParticipants', as: 'meetings' });

module.exports = Meeting;
