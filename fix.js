const fs = require('fs');
const files = [
  'src/services/aggregate-report.service.ts',
  'src/api/controllers/aggregate-report.controller.ts',
  'frontend/src/components/common/AggregateReportModal.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}
console.log('Fixed escaped backticks and dollar signs');
