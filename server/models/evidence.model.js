const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Meeting = require('./meeting.model');

const Evidence = sequelize.define('Evidence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  physicalPath: {
    type: DataTypes.STRING,
    allowNull: true // True for backward compatibility
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  meetingId: {
    type: DataTypes.INTEGER,
    references: {
      model: Meeting,
      key: 'id'
    }
  }
});

// Define associations
Evidence.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Evidence.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'meeting' });
Meeting.hasMany(Evidence, { foreignKey: 'meetingId', as: 'evidenceList' });

module.exports = Evidence;
