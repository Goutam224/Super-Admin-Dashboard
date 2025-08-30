const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{ 
        model: Role, 
        as: 'roles',
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles.some(role => role.name === 'superadmin')) {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, requireSuperAdmin };