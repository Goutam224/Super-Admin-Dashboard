const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  actorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['CREATE', 'UPDATE', 'DELETE', 'ASSIGN_ROLE', 'LOGIN']]
    }
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['USER', 'ROLE', 'SYSTEM']]
    }
  },
  targetId: {
    type: DataTypes.INTEGER
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  indexes: [
    {
      fields: ['actorUserId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = AuditLog;