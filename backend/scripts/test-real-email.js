const axios = require('axios');
const pool = require('../config/database');

async function testRealEmail() {
  try {
    console.log('🧪 Testing REAL email sending...');
    console.log('📧 This will send actual emails to Gmail inboxes!\n');

    // Test with your email first
    console.log('📧 Test 1: Sending to mewdedtesfsh@gmail.com');
    const response1 = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'mewdedtesfsh@gmail.com'
    });
    console.log('✅ Response:', response1.data);

    // Test with another user email if they have Gmail
    console.log('\n📧 Test 2: Checking for other Gmail users...');
    const gmailUsers = await pool.query(
      "SELECT name, email FROM users WHERE email LIKE '%@gmail.com' AND email != 'mewdedtesfsh@gmail.com' LIMIT 3"
    );

    if (gmailUsers.rows.length > 0) {
      console.log('📋 Found other Gmail users:');
      for (const user of gmailUsers.rows) {
        console.log(`  - ${user.name} (${user.email})`);
        
        // Test sending to them too
        try {
          const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: user.email
          });
          console.log(`  ✅ Reset email sent to ${user.email}`);
        } catch (error) {
          console.log(`  ❌ Failed to send to ${user.email}:`, error.response?.data?.error);
        }
      }
    } else {
      console.log('📋 No other Gmail users found in database');
    }

    console.log('\n🎉 Real email testing completed!');
    console.log('📬 Check your Gmail inbox(es) for password reset emails');
    console.log('🔗 Click the reset links to test the complete flow');
    
  } catch (error) {
    console.error('❌ Error testing real emails:', error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

testRealEmail();