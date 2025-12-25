const router = require('express').Router();
const upload = require('../config/upload');
const XLSX = require('xlsx');
const Employee = require('../models/Employee');
const sequelize = require('../config/database');

function parseSheetDirectly(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headers = [];

  // read header row (row 0)
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    headers.push(cell ? String(cell.v).trim() : null);
  }
  const rows = [];

  // read data rows
  for (let R = 1; R <= range.e.r; R++) {
    const row = {};
    let emptyRow = true;

    for (let C = range.s.c; C <= range.e.c; C++) {
      const header = headers[C];
      if (!header) continue;

      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      const value = cell ? cell.v : null;

      if (value !== null && value !== '') emptyRow = false;
      row[header] = value;
    }

    if (!emptyRow && row["SR. NO"] != null) rows.push(row);
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
'EMP. ID',
'ESIC NO',
'PF No',
'UAN No',
'NAME OF THE EMPLOYEE',
'NAME OF THE FATHER/ HUSBAND',
'CATEGORY',
'DESIGNATION',
'DEPARTMENT',
'AADHAAR NO',
'PAN NO.',
'MOBILE NO.',
'BANK A/C NO',
'SEX',
'IFSC CODE NO',
'EMAIL ID',
'DATE OF BIRTH',
'DATE OF JOINING',
'BASIC + DA PER DAY',
'HRA / Allce',
'GROSS WAGES PER DAYA',
'OT Rate per Hrs',
'PRESENT DAYS',
'PAYABLE DAYS',
'OT HRS',
'NAME OF BANK',
'BANK BRANCH',
'ADDRESS',
'ADDRESS 1',
'DISTRICT',
'STATE',
'PIN CODE',
'EDN'
  ];

  const errors = [];
  const validRows = [];

  rows.forEach((row, index) => {
    for (const field of requiredFields) {
      if (row[field] === null || row[field] === undefined) {
        errors.push(`Row ${index + 2}: Missing ${field}`);
        // return;
        console.log(`Row ${index + 2}: Missing ${field}`);
      }
    }

    validRows.push({
        employeeCode: String(row["EMP. ID"]).trim(),

        esicNo: row["ESIC NO"] ? String(row["ESIC NO"]).trim() : null,
        pfNo: row["PF No"] ? String(row["PF No"]).trim() : null,
        uanNo: row["UAN No"] ? String(row["UAN No"]).trim() : null,

        name: String(row["NAME OF THE EMPLOYEE"]).trim(),
        fatherOrHusbandName: row["NAME OF THE FATHER/ HUSBAND"]
            ? String(row["NAME OF THE FATHER/ HUSBAND"]).trim()
            : null,

        category: row["CATEGORY"] ? String(row["CATEGORY"]).trim() : null,
        designation: row["DESIGNATION"] ? String(row["DESIGNATION"]).trim() : null,
        department: row["DEPARTMENT"] ? String(row["DEPARTMENT"]).trim() : null,

        aadhaarNo: row["AADHAAR NO"] ? String(row["AADHAAR NO"]).trim() : null,
        panNo: row["PAN NO."] ? String(row["PAN NO."]).trim() : null,
        mobileNo: row["MOBILE NO."] ? String(row["MOBILE NO."]).trim() : null,
        email: row["EMAIL ID"] ? String(row["EMAIL ID"]).trim() : null,

        sex: row["SEX"] ? String(row["SEX"]).trim() : null,

        dateOfBirth: row["DATE OF BIRTH"] || null,
        dateOfJoining: row["DATE OF JOINING"] || null,

        bankAccountNo: row["BANK A/C NO"] ? String(row["BANK A/C NO"]).trim() : null,
        bankName: row["NAME OF BANK"] ? String(row["NAME OF BANK"]).trim() : null,
        bankBranch: row["BANK BRANCH"] ? String(row["BANK BRANCH"]).trim() : null,
        ifscCode: row["IFSC CODE NO"] ? String(row["IFSC CODE NO"]).trim() : null,

        basicDaPerDay: Number(row["BASIC + DA PER DAY"]),
        hraAllowance: Number(row["HRA / Allce"]),
        grossWagesPerDay: Number(row["GROSS WAGES PER DAYA"]),
        otRatePerHour: Number(row["OT Rate per Hrs"]),

        address: row["ADDRESS"] ? String(row["ADDRESS"]).trim() : null,
        address1: row["ADDRESS 1"] ? String(row["ADDRESS 1"]).trim() : null,
        district: row["DISTRICT"] ? String(row["DISTRICT"]).trim() : null,
        state: row["STATE"] ? String(row["STATE"]).trim() : null,
        pinCode: row["PIN CODE"] ? String(row["PIN CODE"]).trim() : null,

        edn: row["EDN"] ? String(row["EDN"]).trim() : null
    });

  });
  console.log(`Validated ${validRows.length} rows with ${errors.length} errors`);
  console.log('Rows:', validRows);
//   if (errors.length) {
//     return res.status(400).json({ errors });
//   }

  const transaction = await sequelize.transaction();
  try {
    for (const emp of validRows) {
      await Employee.upsert(emp, { transaction });
    }
    await transaction.commit();
    res.json({ message: 'Employees uploaded successfully', count: validRows.length });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
module.exports = router;