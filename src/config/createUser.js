const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const User = require('../models/User');
const Employee = require('../models/Employee');

(async () => {
  await sequelize.sync();

  const passwordHash = await bcrypt.hash('password123', 10);

//   await User.create({
//     email: 'admin@example.com',
//     passwordHash,
//     role: 'ADMIN'
//   });

// await User.create({
//     email: 'akash@example.com',
//     passwordHash,
//     role: 'EMPLOYEE',
//     EmployeeId: 2
//   });

  await User.create({
    email: 'accountant@example.com',
    passwordHash,
    role: 'ACCOUNTANT',
  });

  console.log('Admin user created');
  process.exit(0);
})();
