const router = require('express').Router();
const PDFDocument = require('pdfkit');

const PayrollRun = require('../models/PayrollRun');
const PayrollEntry = require('../models/PayrollEntry');
const Employee = require('../models/Employee');
const StatutoryDeduction = require('../models/StatutoryDeduction');

router.get('/:runId/:employeeId', async (req, res) => {
  const { runId, employeeId } = req.params;

  if (req.session.role !== 'ADMIN' && req.session.employeeId != employeeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const entry = await PayrollEntry.findOne({
    where: {
      PayrollRunId: runId,
      EmployeeId: employeeId
    },
    include: [
      { model: Employee },
      { model: StatutoryDeduction },
      { model: PayrollRun }
    ]
  });

  if (!entry) {
    return res.status(404).json({ error: 'Payslip not found' });
  }

  const emp = entry.Employee;
  const ded = entry.StatutoryDeduction || {};
  const run = entry.PayrollRun;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename=payslip_${emp.employeeCode}_${run.month}_${run.year}.pdf`
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(16).text('PAYSLIP', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Employee Name: ${emp.name}`);
  doc.text(`Employee ID: ${emp.employeeCode}`);
  doc.text(`Department: ${emp.department || '-'}`);
  doc.text(`Designation: ${emp.designation || '-'}`);
  doc.moveDown();

  doc.text(`Payroll Month: ${run.month}/${run.year}`);
  doc.moveDown();

  doc.fontSize(12).text('Earnings');
  doc.fontSize(10);
  doc.text(`Gross Pay: ₹ ${entry.grossPay.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(12).text('Deductions');
  doc.fontSize(10);
  doc.text(`PF: ₹ ${(ded.pfEmployee || 0).toFixed(2)}`);
  doc.text(`ESI: ₹ ${(ded.esiEmployee || 0).toFixed(2)}`);
  doc.text(`Professional Tax: ₹ ${(ded.professionalTax || 0).toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(12).text(`Net Pay: ₹ ${entry.netPay.toFixed(2)}`, {
    underline: true
  });

  doc.moveDown(2);
  doc.fontSize(9).text('This is a system-generated payslip.', {
    align: 'center'
  });

  doc.end();
});

module.exports = router;
