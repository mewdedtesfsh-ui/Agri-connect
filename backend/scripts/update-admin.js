const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function updateAdmin() {
  try {
    console.log('Updating admin account...');

    const adminPassword = await bcrypt.hash('admin@123', 10);
    
    // Delete old admin account
    await pool.query('DELETE FROM users WHERE role = $1', ['admin']);
    console.log('Old admin account deleted');

    // Create new admin account
    await pool.query(
      `INSERT INTO users (name, email, phone, password, role, location) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Admin User', 'admin@gmail.com', '+251911000000', adminPassword, 'admin', 'Addis Ababa']
    );
    console.log('New admin account created with email: admin@gmail.com and password: admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
}

updateAdmin();
