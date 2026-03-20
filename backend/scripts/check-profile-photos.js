const pool = require('../config/database');

async function checkProfilePhotos() {
  try {
    const result = await pool.query(
      'SELECT id, name, email, profile_photo FROM users WHERE profile_photo IS NOT NULL'
    );
    
    console.log('\n=== Users with Profile Photos ===');
    if (result.rows.length === 0) {
      console.log('No users have profile photos set.');
    } else {
      result.rows.forEach(user => {
        console.log(`\nUser ID: ${user.id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Profile Photo: ${user.profile_photo}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProfilePhotos();
