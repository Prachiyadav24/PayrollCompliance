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

router.post('/finalize/:id', async (req, res) => {
  const { id } = req.params;

  const payrollRun = await PayrollRun.findByPk(id);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status === 'FINALIZED') {
    return res.status(400).json({ error: 'Payroll already finalized' });
  }

  payrollRun.status = 'FINALIZED';
  await payrollRun.save();

  res.json({
    message: 'Payroll finalized',
    payrollRunId: payrollRun.id
  });
});


router.post('/calculate/:runId', async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate payroll for finalized run'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [
      {
        model: Employee
      }
    ]
  });

  if (!entries.length) {
    return res.status(400).json({ error: 'No payroll entries found' });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log(entries);
    for (const entry of entries) {
      const employee = entry.Employee;
      console.log('Calculating payroll for employee:', employee.id, employee);
      const attendance = await Attendance.findOne({
        where: {
          EmployeeId: employee.id,
          month: payrollRun.month,
          year: payrollRun.year
        }
      });

      if (!attendance) continue;

      const basicDaPerDay = Number(employee.basicDaPerDay) || 0;
      const hra = Number(employee.hraAllowance) || 0;
      const otRate = Number(employee.otRatePerHour) || 0;

      const payableDays = Number(attendance.payableDays) || 0;
      const otHours = Number(attendance.overtimeHours) || 0;

      const wages = basicDaPerDay * payableDays;
      const otPay = otHours * otRate;

      const grossPay = wages + hra + otPay;

      entry.grossPay = grossPay;
      entry.totalDeductions = 0;
      entry.netPay = grossPay;

      await entry.save({ transaction });
    }

    await transaction.commit();

    res.json({
      message: 'Gross payroll calculated',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'Payroll calculation failed',
      details: err.message
    });
  }
});

const StatutoryDeduction = require('../models/StatutoryDeduction');
const { requireRole } = require('../middleware/auth');

router.post('/calculate-pf/:runId', async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate PF for finalized payroll'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [
      { model: Employee }
    ]
  });

  const transaction = await sequelize.transaction();

  try {
    for (const entry of entries) {
      const employee = entry.Employee;

      const basicDaPerDay = Number(employee.basicDaPerDay) || 0;

      const attendance = await Attendance.findOne({
        where: {
          EmployeeId: employee.id,
          month: payrollRun.month,
          year: payrollRun.year
        }
      });

      if (!attendance) continue;
      const payableDays = Number(attendance.payableDays) || 0;
      const pfWages = basicDaPerDay * payableDays;
      
      console.log(basicDaPerDay, payableDays);
      const pfEmployee = pfWages * 0.12;
      const pfEmployer = pfWages * 0.12;

      await StatutoryDeduction.upsert({
        PayrollEntryId: entry.id,
        pfEmployee,
        pfEmployer
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      message: 'PF calculated successfully',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'PF calculation failed',
      details: err.message
    });
  }
});

router.post('/calculate-esi/:runId', async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate ESI for finalized payroll'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [{ model: Employee }]
  });

  const ESI_WAGE_LIMIT = 21000;
  const ESI_EMP_RATE = 0.0075;
  const ESI_EMPR_RATE = 0.0325;

  const transaction = await sequelize.transaction();

  try {
    for (const entry of entries) {
      const grossPay = Number(entry.grossPay) || 0;

      let esiEmployee = 0;
      let esiEmployer = 0;

      if (grossPay > 0 && grossPay <= ESI_WAGE_LIMIT) {
        esiEmployee = grossPay * ESI_EMP_RATE;
        esiEmployer = grossPay * ESI_EMPR_RATE;
      }

      await StatutoryDeduction.upsert({
        PayrollEntryId: entry.id,
        esiEmployee,
        esiEmployer
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      message: 'ESI calculated successfully',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'ESI calculation failed',
      details: err.message
    });
  }
});

router.post('/calculate-pt/:runId', async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate PT for finalized payroll'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId }
  });

  const transaction = await sequelize.transaction();

  try {
    for (const entry of entries) {
      const grossPay = Number(entry.grossPay) || 0;

      let professionalTax = 0;

      if (grossPay > 10000) {
        professionalTax = 200;
      } else if (grossPay > 7500) {
        professionalTax = 175;
      }

      await StatutoryDeduction.upsert({
        PayrollEntryId: entry.id,
        professionalTax
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      message: 'Professional Tax calculated successfully',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'PT calculation failed',
      details: err.message
    });
  }
});

router.post('/calculate-net/:runId', async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate net pay for finalized payroll'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [{ model: StatutoryDeduction }]
  });

  const transaction = await sequelize.transaction();

  try {
    for (const entry of entries) {
      const grossPay = Number(entry.grossPay) || 0;
      const deductions = entry.StatutoryDeduction || {};

      const pf = Number(deductions.pfEmployee) || 0;
      const esi = Number(deductions.esiEmployee) || 0;
      const pt = Number(deductions.professionalTax) || 0;
      const tds = Number(deductions.tds) || 0; // future-proof

      const totalDeductions = pf + esi + pt + tds;
      const netPay = grossPay - totalDeductions;

      entry.totalDeductions = totalDeductions;
      entry.netPay = netPay;

      await entry.save({ transaction });
    }

    await transaction.commit();

    res.json({
      message: 'Net pay calculated successfully',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'Net pay calculation failed',
      details: err.message
    });
  }
});

router.post('/calculate-tds/:runId', requireRole('ADMIN'), async (req, res) => {
  const { runId } = req.params;

  const payrollRun = await PayrollRun.findByPk(runId);

  if (!payrollRun) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  if (payrollRun.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Cannot calculate TDS for finalized payroll'
    });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [{ model: StatutoryDeduction }]
  });

  const STANDARD_DEDUCTION = 50000;

  function calculateAnnualTax(taxableIncome) {
    let tax = 0;

    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax =
        (250000 * 0.05) +
        (taxableIncome - 500000) * 0.2;
    } else {
      tax =
        (250000 * 0.05) +
        (500000 * 0.2) +
        (taxableIncome - 1000000) * 0.3;
    }

    return tax;
  }

  const transaction = await sequelize.transaction();

  try {
    for (const entry of entries) {
      const monthlyGross = Number(entry.grossPay) || 0;

      const annualGross = monthlyGross * 12;
      const taxableIncome = Math.max(
        annualGross - STANDARD_DEDUCTION,
        0
      );
      const annualTax = calculateAnnualTax(taxableIncome);
      const monthlyTds = annualTax / 12;

      await StatutoryDeduction.upsert({
        PayrollEntryId: entry.id,
        tds: monthlyTds
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      message: 'TDS calculated successfully',
      payrollRunId: runId
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      error: 'TDS calculation failed',
      details: err.message
    });
  }
});

router.get('/run/:id', async (req, res) => {
  const run = await PayrollRun.findByPk(req.params.id, {
    include: [
      {
        model: PayrollEntry,
        include: [Employee, StatutoryDeduction]
      }
    ]
  });

  if (!run) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  res.json(run);
});

const { requireAuth } = require('../middleware/auth');

router.get('/my-runs', requireAuth, async (req, res) => {
  if (req.session.role !== 'EMPLOYEE') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const entries = await PayrollEntry.findAll({
    where: { EmployeeId: req.session.employeeId },
    include: [PayrollRun],
    order: [[PayrollRun, 'year', 'DESC'], [PayrollRun, 'month', 'DESC']]
  });

  const runs = entries.map(e => ({
    runId: e.PayrollRun.id,
    month: e.PayrollRun.month,
    year: e.PayrollRun.year,
    status: e.PayrollRun.status
  }));

  res.json(runs);
});



module.exports = router;
