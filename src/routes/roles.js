const express = require('express');
const Role = require('../models/Role');
const User = require('../models/User');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');
const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/v1/superadmin/roles - List all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ 
        model: User, 
        as: 'users',
        through: { attributes: [] },
        attributes: ['id', 'name', 'email']
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        userCount: role.users.length,
        users: role.users,
        createdAt: role.createdAt
      }))
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/v1/superadmin/roles - Create role
router.post('/', async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const role = await Role.create({
      name,
      permissions: Array.isArray(permissions) ? permissions : []
    });

    // Log audit
    await logAudit(req.user.id, 'CREATE', 'ROLE', role.id, { 
      roleName: role.name,
      permissions: role.permissions 
    });

    res.status(201).json({
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: role.createdAt
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT /api/v1/superadmin/roles/:id - Update role
router.put('/:id', async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const roleId = req.params.id;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent updating superadmin role
    if (role.name === 'superadmin' && name && name !== 'superadmin') {
      return res.status(400).json({ error: 'Cannot modify superadmin role name' });
    }

    // Update fields
    if (name) role.name = name;
    if (permissions !== undefined) role.permissions = Array.isArray(permissions) ? permissions : [];

    await role.save();

    // Log audit
    await logAudit(req.user.id, 'UPDATE', 'ROLE', role.id, { 
      roleName: role.name,
      updatedFields: Object.keys(req.body)
    });

    res.json({
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      updatedAt: role.updatedAt
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// POST /api/v1/superadmin/assign-role - Assign role to user
router.post('/assign-role', async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }

    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if user already has this role
    const hasRole = await user.hasRole(role);
    if (hasRole) {
      return res.status(400).json({ error: 'User already has this role' });
    }

    await user.addRole(role);

    // Log audit
    await logAudit(req.user.id, 'ASSIGN_ROLE', 'USER', userId, { 
      assignedRole: role.name,
      targetUserEmail: user.email 
    });

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

module.exports = router;