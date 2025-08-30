const express = require('express');
const { Op } = require('sequelize');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/v1/superadmin/audit-logs - Get audit logs with filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action = '', 
      userId = '',
      startDate = '',
      endDate = '' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.actorUserId = userId;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.timestamp[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [{ 
        model: User, 
        as: 'actor',
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details,
        timestamp: log.timestamp
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;