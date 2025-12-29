const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM('ADMIN', 'ACCOUNTANT', 'EMPLOYEE'),
    allowNull: false
  }
});

// optional link for employee users
User.belongsTo(Employee, { allowNull: true });
Employee.hasOne(User);

module.exports = User;
