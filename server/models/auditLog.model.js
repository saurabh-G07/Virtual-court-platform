const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Meeting = require('./meeting.model');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  meetingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Meeting,
      key: 'id'
    }
  }
});

// Define associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'meeting' });
Meeting.hasMany(AuditLog, { foreignKey: 'meetingId', as: 'auditLogs' });

module.exports = AuditLog;
