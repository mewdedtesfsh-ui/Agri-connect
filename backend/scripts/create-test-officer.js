const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function createTestOfficer() {
  try {
    const password = await bcrypt.hash('officer123', 10);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, location, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO UPDATE 
       SET approval_status = 'pending'
       RETURNING id, email, role, approval_status`,
      ['Test Officer', 'officer@gmail.com', '+251955555555', password, 'extension_officer', 'Addis Ababa', 'pending']
    );
    
    console.log('✓ Test officer created/updated:');
    console.log(result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestOfficer();
