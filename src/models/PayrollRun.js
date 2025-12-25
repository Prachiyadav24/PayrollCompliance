const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PayrollRun = sequelize.define('PayrollRun', {
  month: DataTypes.INTEGER,
  year: DataTypes.INTEGER,
  status: { type: DataTypes.STRING, defaultValue: 'DRAFT' },
  runDate: DataTypes.DATE
});

module.exports = PayrollRun;
