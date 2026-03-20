const pool = require('../config/database');

async function checkDatabase() {
  try {
    console.log('\n=== Direct Database Check ===\n');
    
    // Check all users and their profile photos
    const result = await pool.query(
      'SELECT id, name, email, role, profile_photo FROM users ORDER BY id'
    );
    
    console.log(`Found ${result.rows.length} users:\n`);
    
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Profile Photo: ${user.profile_photo || 'NULL'}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
