const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PayrollEntry = require('./PayrollEntry');

const StatutoryDeduction = sequelize.define('StatutoryDeduction', {
  pfEmployee: DataTypes.FLOAT,
  pfEmployer: DataTypes.FLOAT,
  esiEmployee: DataTypes.FLOAT,
  esiEmployer: DataTypes.FLOAT,
  professionalTax: DataTypes.FLOAT,
  tds: DataTypes.FLOAT
}, {
  indexes: [
    {
      unique: true,
      fields: ['PayrollEntryId']
    }
  ]
});

StatutoryDeduction.belongsTo(PayrollEntry);
PayrollEntry.hasOne(StatutoryDeduction);

module.exports = StatutoryDeduction;
