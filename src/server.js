const app = require('./app');
const sequelize = require('./config/database');
require('./models/Employee');
require('./models/Attendance');
require('./models/PayrollRun');
require('./models/PayrollEntry');
require('./models/StatutoryDeduction');

const PORT = process.env.PORT || 3000;

(async () => {
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
})();
