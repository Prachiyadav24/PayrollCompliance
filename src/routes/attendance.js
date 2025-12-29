const router = require('express').Router();
const upload = require('../config/upload');
const XLSX = require('xlsx');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const sequelize = require('../config/database');
const PayrollRun = require('../models/PayrollRun');

function parseSheetDirectly(sheet, headerRowIndex = 7) {
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headers = [];

  // read headers from row 8 (index 7)
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRowIndex, c: C })];
    headers.push(cell ? String(cell.v).trim() : null);
  }

  const rows = [];

  // data starts from row 9 (index 8)
  for (let R = headerRowIndex + 1; R <= range.e.r; R++) {
    const row = {};
    let empty = true;

    for (let C = range.s.c; C <= range.e.c; C++) {
      const header = headers[C];
      if (!header) continue;

      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      const value = cell ? cell.v : null;

      if (value !== null && value !== '') empty = false;
      row[header] = value;
    }

    if (!empty) rows.push(row);
  }

  return rows;
}


router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File required' });
  }

  let rows;
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = parseSheetDirectly(sheet);
  } catch {
    return res.status(400).json({ error: 'Invalid file format' });
  }

  const requiredFields = [
    'Emp ID.',
    'MONTH',
    'YEAR',
    'Present Days',
    'Payable Days',
    'OT Hrs'
  ];

  const errors = [];
  const validRows = [];

  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    for (const field of requiredFields) {
      if (row[field] === null || row[field] === undefined) {
        // errors.push(`Row ${i + 2}: Missing ${field}`);
        continue;
      }
    }
    console.log('Validating row for Emp ID:', row['Emp ID.']);

    const employee = await Employee.findOne({
      where: { employeeCode: String(row['Emp ID.']).trim() }
    });
    console.log('Processing row for Emp ID:', row['Emp ID.'], 'Found employee:', !!employee);
    if (!employee) {
      errors.push(`Row ${i + 2}: Employee not found`);
      continue;
    }

    const lockedRun = await PayrollRun.findOne({
    where: {
        month: Number(10), //10
        year: Number(25), //25
        status: 'FINALIZED'
    }
    });

    if (lockedRun) {
    errors.push(
        `Row ${i + 2}: Payroll finalized for ${row['MONTH']}/${row['YEAR']}`
    );
    continue;
    }


    validRows.push({
      EmployeeId: employee.id,
      month: Number(10),
      year: Number(25),
      daysPresent: Number(row['Present Days']),
      payableDays: Number(row['Payable Days']),
      overtimeHours: Number(row['OT Hrs'])
    });
    console.log(validRows[validRows.length - 1]);
  }

  if (errors.length) {
    // return res.status(400).json({ errors }); 
  }

  const transaction = await sequelize.transaction();
  try {
    console.log('Upserting attendance records:', validRows);
    for (const att of validRows) {
      await Attendance.upsert(att, {
        where: {
          EmployeeId: att.EmployeeId,
          month: att.month,
          year: att.year
        },
        transaction
      });
    }

    await transaction.commit();
    res.json({
      message: 'Attendance uploaded successfully',
      count: validRows.length
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/', async (req, res) => {
    console.log('Fetching attendance with query:', req.query);
  const { month, year } = req.query;
  const where = {};
  if (month) where.month = month;
  if (year) where.year = year;

  const data = await Attendance.findAll({
    where,
    include: Employee
  });

  res.json(data);
});

module.exports = router;
