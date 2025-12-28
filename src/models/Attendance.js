const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  month: DataTypes.INTEGER,
  year: DataTypes.INTEGER,
  daysPresent: DataTypes.INTEGER,
  overtimeHours: DataTypes.FLOAT
}, {
  indexes: [
    {
      unique: true,
      fields: ['EmployeeId', 'month', 'year']
    }
  ]
});

Attendance.belongsTo(Employee);
Employee.hasMany(Attendance);

module.exports = Attendance;
