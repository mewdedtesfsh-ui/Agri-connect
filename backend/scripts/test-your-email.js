const axios = require('axios');

async function testYourEmail() {
  try {
    console.log('🧪 Testing forgot password for: mewdedtesfsh@gmail.com');
    
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'mewdedtesfsh@gmail.com'
    });
    
    console.log('✅ API Response:', response.data);
    console.log('\n📧 Check the server console for the reset link that would be sent!');
    console.log('💡 The link will be logged since we\'re in development mode.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testYourEmail();