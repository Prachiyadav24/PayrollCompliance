const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const PayrollRun = require('./PayrollRun');

const PayrollEntry = sequelize.define('PayrollEntry', {
  grossPay: DataTypes.FLOAT,
  netPay: DataTypes.FLOAT,
  totalDeductions: DataTypes.FLOAT
});

PayrollEntry.belongsTo(Employee);
PayrollEntry.belongsTo(PayrollRun);
Employee.hasMany(PayrollEntry);
PayrollRun.hasMany(PayrollEntry);

module.exports = PayrollEntry;
