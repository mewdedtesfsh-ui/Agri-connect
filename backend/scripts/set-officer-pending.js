const pool = require('../config/database');

async function setOfficerPending() {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'pending' 
       WHERE email = 'officer@gmail.com'
       RETURNING email, role, approval_status`
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Updated officer status:');
      console.log(result.rows[0]);
    } else {
      console.log('✗ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setOfficerPending();
