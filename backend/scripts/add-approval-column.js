const pool = require('../config/database');

async function addApprovalColumn() {
  try {
    // Add approval_status column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved' 
      CHECK (approval_status IN ('pending', 'approved', 'banned'))
    `);
    
    console.log('✓ Added approval_status column to users table');
    
    // Set existing users to approved
    await pool.query(`
      UPDATE users 
      SET approval_status = 'approved' 
      WHERE approval_status IS NULL
    `);
    
    console.log('✓ Set existing users to approved');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding approval column:', error);
    process.exit(1);
  }
}

addApprovalColumn();
