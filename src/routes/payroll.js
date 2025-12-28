const router = require('express').Router();
const sequelize = require('../config/database');
const PayrollRun = require('../models/PayrollRun');
const PayrollEntry = require('../models/PayrollEntry');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

router.post('/run', async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year required' });
  }

  const transaction = await sequelize.transaction();

  try {
    // prevent duplicate payroll runs
    const existingRun = await PayrollRun.findOne({
      where: { month, year }
    });

    if (existingRun) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Payroll run already exists for this month'
      });
    }

    // fetch attendance snapshot
    const attendanceRows = await Attendance.findAll({
      where: { month, year },
      include: Employee
    });

    if (!attendanceRows.length) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'No attendance found for this month'
      });
    }

    // create payroll run
    const payrollRun = await PayrollRun.create(
      { month, year },
      { transaction }
    );

    // create payroll entry stubs
    for (const att of attendanceRows) {
      await PayrollEntry.create({
        PayrollRunId: payrollRun.id,
        EmployeeId: att.EmployeeId,
        grossPay: 0,
        netPay: 0,
        totalDeductions: 0
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      message: 'Payroll run created',
      payrollRunId: payrollRun.id,
      entriesCreated: attendanceRows.length
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'Failed to create payroll run',
      details: err.message
    });
  }
});

router.get('/runs', async (_, res) => {
  const runs = await PayrollRun.findAll({
    order: [['year', 'DESC'], ['month', 'DESC']]
  });
  res.json(runs);
});

module.exports = router;
