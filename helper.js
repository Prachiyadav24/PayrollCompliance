const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'Master data format.xlsx');

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

if (!sheet['!ref']) {
  console.log('Sheet is empty');
  process.exit(0);
}

const range = XLSX.utils.decode_range(sheet['!ref']);

const headers = [];
const firstRow = [];

for (let c = range.s.c; c <= range.e.c; c++) {
  const headerCell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
  headers.push(headerCell ? headerCell.v : null);

  const dataCell = sheet[XLSX.utils.encode_cell({ r: 1, c })];
  firstRow.push(dataCell ? dataCell.v : null);
}

console.log('Headers:');
headers.forEach(h => console.log('-', h));

console.log('\nFirst data row:');
headers.forEach((h, i) => {
  console.log(`${h}: ${firstRow[i]}`);
});
