const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PayrollRun = sequelize.define('PayrollRun', {
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'DRAFT'
  },
  runDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['month', 'year']
    }
  ]
});

module.exports = PayrollRun;
