const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const User = require('../models/User');

(async () => {
  await sequelize.sync();

  const passwordHash = await bcrypt.hash('password123', 10);

  await User.create({
    email: 'admin@example.com',
    passwordHash,
    role: 'ADMIN'
  });

  console.log('Admin user created');
  process.exit(0);
})();
