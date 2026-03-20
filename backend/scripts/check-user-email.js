const pool = require('../config/database');

async function checkUserEmail() {
  try {
    console.log('🔍 Checking for user email: mewdedtesfsh@gmail.com');
    
    const result = await pool.query('SELECT id, name, email FROM users WHERE email = $1', ['mewdedtesfsh@gmail.com']);
    
    if (result.rows.length > 0) {
      console.log('✅ User found:', result.rows[0]);
      return true;
    } else {
      console.log('❌ User not found with email: mewdedtesfsh@gmail.com');
      console.log('\n📋 Available users in database:');
      const allUsers = await pool.query('SELECT name, email FROM users ORDER BY created_at DESC LIMIT 10');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

checkUserEmail();