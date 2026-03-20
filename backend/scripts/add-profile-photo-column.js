const pool = require('../config/database');

async function addProfilePhotoColumn() {
  try {
    console.log('Adding profile_photo column to users table...');
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255)
    `);
    
    console.log('✓ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error adding column:', error);
    process.exit(1);
  }
}

addProfilePhotoColumn();
