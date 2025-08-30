const AuditLog = require('../models/AuditLog');

const logAudit = async (actorUserId, action, targetType, targetId = null, details = {}) => {
  try {
    await AuditLog.create({
      actorUserId,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date()
    });
    console.log(`📝 Audit logged: ${action} on ${targetType} by user ${actorUserId}`);
  } catch (error) {
    console.error('❌ Audit log error:', error);
  }
};

module.exports = { logAudit };