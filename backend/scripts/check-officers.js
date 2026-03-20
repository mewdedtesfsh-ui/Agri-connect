const pool = require('../config/database');

async function checkOfficers() {
  try {
    const result = await pool.query(
      "SELECT id, email, role, approval_status FROM users WHERE email = 'officer@gmail.com'"
    );
    console.log('Officer status:');
    console.log(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOfficers();
