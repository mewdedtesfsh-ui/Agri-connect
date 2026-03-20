const pool = require('../config/database');

async function testForgotPassword() {
  try {
    console.log('🔍 Testing forgot password functionality...');

    // Check if reset token columns exist
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expiry')
      ORDER BY column_name
    `);

    console.log('📊 Database columns found:', columnCheck.rows.map(r => r.column_name));

    // Check if we have any users to test with
    const userCheck = await pool.query('SELECT id, name, email FROM users LIMIT 5');
    console.log('👥 Available test users:');
    userCheck.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Test the reset token functionality
    if (userCheck.rows.length > 0) {
      const testUser = userCheck.rows[0];
      const testToken = 'test-token-' + Date.now();
      const expiry = new Date(Date.now() + 3600000); // 1 hour from now

      console.log(`\n🧪 Testing reset token for user: ${testUser.email}`);
      
      // Set reset token
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
        [testToken, expiry, testUser.id]
      );

      // Verify token was set
      const tokenCheck = await pool.query(
        'SELECT reset_token, reset_token_expiry FROM users WHERE id = $1',
        [testUser.id]
      );

      if (tokenCheck.rows[0].reset_token === testToken) {
        console.log('✅ Reset token set successfully');
        console.log('🕐 Token expires at:', tokenCheck.rows[0].reset_token_expiry);
      } else {
        console.log('❌ Failed to set reset token');
      }

      // Clean up test token
      await pool.query(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1',
        [testUser.id]
      );
      console.log('🧹 Test token cleaned up');
    }

    console.log('\n✅ Forgot password functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testForgotPassword();