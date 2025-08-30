// Import models with absolute paths to avoid circular dependencies
const sequelize = require('./index');
const User = require('./User');
const Role = require('./Role');
const AuditLog = require('./AuditLog');

// Make sure all models are loaded before creating associations
const initAssociations = () => {
  // User-Role many-to-many relationship
  User.belongsToMany(Role, { 
    through: 'UserRoles',
    as: 'roles',
    foreignKey: 'userId'
  });

  Role.belongsToMany(User, { 
    through: 'UserRoles',
    as: 'users',
    foreignKey: 'roleId'
  });

  // AuditLog-User relationship
  AuditLog.belongsTo(User, {
    foreignKey: 'actorUserId',
    as: 'actor'
  });

  User.hasMany(AuditLog, {
    foreignKey: 'actorUserId',
    as: 'auditLogs'
  });

  console.log('✅ Database associations created');
};

// Export models and init function
module.exports = { 
  User, 
  Role, 
  AuditLog, 
  initAssociations 
};