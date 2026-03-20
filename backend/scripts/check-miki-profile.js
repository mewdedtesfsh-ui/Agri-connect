const pool = require('../config/database');

async function checkMikiProfile() {
  try {
    const result = await pool.query('SELECT name, email, profile_photo FROM users WHERE email = $1', ['miki@gmail.com']);
    console.log('Miki user data:', result.rows[0]);
    
    if (result.rows[0] && result.rows[0].profile_photo) {
      console.log('✅ Miki has a profile photo:', result.rows[0].profile_photo);
    } else {
      console.log('❌ Miki does not have a profile photo');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkMikiProfile();