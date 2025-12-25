const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  employeeCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  esicNo: DataTypes.STRING,
  pfNo: DataTypes.STRING,
  uanNo: DataTypes.STRING,

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  fatherOrHusbandName: DataTypes.STRING,

  category: DataTypes.STRING,
  designation: DataTypes.STRING,
  department: DataTypes.STRING,

  aadhaarNo: DataTypes.STRING,
  panNo: DataTypes.STRING,
  mobileNo: DataTypes.STRING,
  email: DataTypes.STRING,

  sex: DataTypes.STRING,

  dateOfBirth: DataTypes.DATEONLY,
  dateOfJoining: DataTypes.DATEONLY,

  bankAccountNo: DataTypes.STRING,
  bankName: DataTypes.STRING,
  bankBranch: DataTypes.STRING,
  ifscCode: DataTypes.STRING,

  basicDaPerDay: DataTypes.FLOAT,
  hraAllowance: DataTypes.FLOAT,
  grossWagesPerDay: DataTypes.FLOAT,
  otRatePerHour: DataTypes.FLOAT,

  address: DataTypes.TEXT,
  address1: DataTypes.TEXT,
  district: DataTypes.STRING,
  state: DataTypes.STRING,
  pinCode: DataTypes.STRING,

  edn: DataTypes.STRING,

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Employee;
