const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function checkAdmin() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@gmail.com']);
    
    if (result.rows.length === 0) {
      console.log('Admin account NOT found!');
    } else {
      const admin = result.rows[0];
      console.log('Admin account found:');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Name:', admin.name);
      
      // Test password
      const testPassword = 'admin@123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log('Password "admin@123" is valid:', isValid);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
