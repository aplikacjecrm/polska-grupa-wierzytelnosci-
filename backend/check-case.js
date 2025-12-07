const { getDatabase } = require('./database/init');

const db = getDatabase();

db.get('SELECT id, case_number, case_type FROM cases WHERE case_number LIKE "%AA01%"', (err, row) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📋 Sprawa w bazie:');
    console.log(JSON.stringify(row, null, 2));
  }
  process.exit(0);
});
