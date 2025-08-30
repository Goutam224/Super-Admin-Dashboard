const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/v1/superadmin/analytics/summary - Get basic analytics
router.get('/summary', async (req, res) => {
  try {
    // Total users count
    const totalUsers = await User.count();

    // Total roles count
    const totalRoles = await Role.count();

    // Users who logged in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentActivity = await AuditLog.count({
      where: {
        timestamp: {
          [Op.gte]: oneDayAgo
        }
      }
    });

    // Users created in last 7 days
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      summary: {
        totalUsers,
        totalRoles,
        activeUsers7d: activeUsers,
        newUsers7d: newUsers,
        recentActivity24h: recentActivity
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;