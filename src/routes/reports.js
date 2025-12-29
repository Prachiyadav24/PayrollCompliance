const router = require('express').Router();
const { Parser } = require('json2csv');

const PayrollRun = require('../models/PayrollRun');
const PayrollEntry = require('../models/PayrollEntry');
const Employee = require('../models/Employee');
const StatutoryDeduction = require('../models/StatutoryDeduction');

router.get('/payroll-register/:runId', async (req, res) => {
  const { runId } = req.params;

  const run = await PayrollRun.findByPk(runId);
  if (!run) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [
      { model: Employee },
      { model: StatutoryDeduction }
    ]
  });

  const rows = entries.map(entry => {
    const emp = entry.Employee;
    const ded = entry.StatutoryDeduction || {};

    return {
      'EMP ID': emp.employeeCode,
      'EMP NAME': emp.name,
      'MONTH': run.month,
      'YEAR': run.year,
      'GROSS PAY': entry.grossPay,
      'PF (EMP)': ded.pfEmployee || 0,
      'ESI (EMP)': ded.esiEmployee || 0,
      'PROFESSIONAL TAX': ded.professionalTax || 0,
      'TOTAL DEDUCTIONS': entry.totalDeductions,
      'NET PAY': entry.netPay
    };
  });

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=payroll_register_${run.month}_${run.year}.csv`
  );

  res.send(csv);
});

const Attendance = require('../models/Attendance');

router.get('/pf-register/:runId', async (req, res) => {
  const { runId } = req.params;

  const run = await PayrollRun.findByPk(runId);
  if (!run) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [
      { model: Employee },
      { model: StatutoryDeduction }
    ]
  });

  const rows = [];

  for (const entry of entries) {
    const emp = entry.Employee;
    const ded = entry.StatutoryDeduction || {};

    const attendance = await Attendance.findOne({
      where: {
        EmployeeId: emp.id,
        month: run.month,
        year: run.year
      }
    });

    const payableDays = attendance ? Number(attendance.payableDays) : 0;
    const basicDaPerDay = Number(emp.basicDaPerDay) || 0;
    const pfWages = basicDaPerDay * payableDays;

    rows.push({
      'EMP ID': emp.employeeCode,
      'EMP NAME': emp.name,
      'UAN NO': emp.uanNo || '',
      'PF NO': emp.pfNo || '',
      'PF WAGES': pfWages,
      'PF EMPLOYEE': ded.pfEmployee || 0,
      'PF EMPLOYER': ded.pfEmployer || 0,
      'MONTH': run.month,
      'YEAR': run.year
    });
  }

  const parser = new (require('json2csv').Parser)();
  const csv = parser.parse(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=pf_register_${run.month}_${run.year}.csv`
  );

  res.send(csv);
});

router.get('/esi-register/:runId', async (req, res) => {
  const { runId } = req.params;

  const run = await PayrollRun.findByPk(runId);
  if (!run) {
    return res.status(404).json({ error: 'Payroll run not found' });
  }

  const entries = await PayrollEntry.findAll({
    where: { PayrollRunId: runId },
    include: [
      { model: Employee },
      { model: StatutoryDeduction }
    ]
  });

  const rows = entries.map(entry => {
    const emp = entry.Employee;
    const ded = entry.StatutoryDeduction || {};

    return {
      'EMP ID': emp.employeeCode,
      'EMP NAME': emp.name,
      'ESIC NO': emp.esicNo || '',
      'GROSS WAGES': entry.grossPay,
      'ESI EMPLOYEE': ded.esiEmployee || 0,
      'ESI EMPLOYER': ded.esiEmployer || 0,
      'MONTH': run.month,
      'YEAR': run.year
    };
  });

  const parser = new (require('json2csv').Parser)();
  const csv = parser.parse(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=esi_register_${run.month}_${run.year}.csv`
  );

  res.send(csv);
});


module.exports = router;
