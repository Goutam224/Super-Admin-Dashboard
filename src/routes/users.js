const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');
const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/v1/superadmin/users - List users with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const include = [{ 
      model: Role, 
      as: 'roles',
      through: { attributes: [] },
      ...(role && { where: { name: role } })
    }];

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/v1/superadmin/users/:id - Get user detail
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ 
        model: Role, 
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/v1/superadmin/users - Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, roleIds = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      hashedPassword
    });

    // Assign roles if provided
    if (roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.addRoles(roles);
    }

    // Log audit
    await logAudit(req.user.id, 'CREATE', 'USER', user.id, { 
      email: user.email,
      assignedRoles: roleIds 
    });

    // Fetch user with roles
    const createdUser = await User.findByPk(user.id, {
      include: [{ 
        model: Role, 
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      roles: createdUser.roles,
      createdAt: createdUser.createdAt
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/v1/superadmin/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ 
        where: { email, id: { [Op.ne]: userId } } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      user.email = email;
    }
    if (password) {
      user.hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Update roles if provided
    if (roleIds !== undefined) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.setRoles(roles);
    }

    // Log audit
    await logAudit(req.user.id, 'UPDATE', 'USER', user.id, { 
      updatedFields: Object.keys(req.body),
      email: user.email 
    });

    // Fetch updated user with roles
    const updatedUser = await User.findByPk(userId, {
      include: [{ 
        model: Role, 
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      roles: updatedUser.roles,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/v1/superadmin/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log audit before deletion
    await logAudit(req.user.id, 'DELETE', 'USER', user.id, { 
      deletedEmail: user.email 
    });

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;