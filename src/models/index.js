const { Sequelize } = require('sequelize');
const path = require('path');

console.log('Loading database connection...');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../', process.env.DB_NAME || 'superadmin.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

console.log('Database configuration loaded');

module.exports = sequelize;