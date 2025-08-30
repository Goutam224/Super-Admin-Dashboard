const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🌱 Starting database seed...');

// Create database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../', process.env.DB_NAME || 'superadmin.sqlite'),
  logging: false
});

// Define models directly in seed script
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  hashedPassword: { type: DataTypes.STRING, allowNull: false },
  lastLogin: { type: DataTypes.DATE }
}, { timestamps: true });

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  permissions: { type: DataTypes.JSON, defaultValue: [] }
}, { timestamps: true });

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  actorUserId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  targetType: { type: DataTypes.STRING, allowNull: false },
  targetId: { type: DataTypes.INTEGER },
  details: { type: DataTypes.JSON, defaultValue: {} },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });

// Define associations
User.belongsToMany(Role, { through: 'UserRoles', as: 'roles', foreignKey: 'userId' });
Role.belongsToMany(User, { through: 'UserRoles', as: 'users', foreignKey: 'roleId' });
AuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });

async function seed() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized.');

    // Create roles
    const superAdminRole = await Role.create({
      name: 'superadmin',
      permissions: ['all', 'read', 'write', 'delete', 'manage_users', 'manage_roles']
    });

    const adminRole = await Role.create({
      name: 'admin',
      permissions: ['read', 'write', 'manage_users']
    });

    const userRole = await Role.create({
      name: 'user',
      permissions: ['read']
    });

    console.log('✅ Roles created.');

    // Create test superadmin user
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      hashedPassword
    });

    // Create test users
    const testUser1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      hashedPassword: await bcrypt.hash('password123', 10)
    });

    const testUser2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      hashedPassword: await bcrypt.hash('password123', 10)
    });

    // Assign roles
    await superAdmin.addRole(superAdminRole);
    await testUser1.addRole(adminRole);
    await testUser2.addRole(userRole);

    console.log('✅ Users created and roles assigned.');
    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Test Accounts:');
    console.log('┌─────────────────────────────────────┐');
    console.log('│ Super Admin Login:                  │');
    console.log('│  Email: superadmin@example.com      │');
    console.log('│  Password: Test1234!                │');
    console.log('├─────────────────────────────────────┤');
    console.log('│ Test User Login:                    │');
    console.log('│  Email: john@example.com            │');
    console.log('│  Password: password123              │');
    console.log('└─────────────────────────────────────┘');
    console.log('');
    console.log('Database file created at:', path.join(__dirname, '../', process.env.DB_NAME || 'superadmin.sqlite'));
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();