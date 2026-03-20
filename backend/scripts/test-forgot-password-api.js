const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testForgotPasswordAPI() {
  try {
    console.log('🧪 Testing Forgot Password API endpoints...\n');

    // Test 1: Forgot password with valid email
    console.log('📧 Test 1: Forgot password with valid email');
    try {
      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: 'abebe@example.com'
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Forgot password with invalid email
    console.log('📧 Test 2: Forgot password with non-existent email');
    try {
      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: 'nonexistent@example.com'
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Forgot password with missing email
    console.log('📧 Test 3: Forgot password with missing email');
    try {
      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {});
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Reset password with invalid token
    console.log('🔐 Test 4: Reset password with invalid token');
    try {
      const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: 'invalid-token',
        password: 'newpassword123'
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Reset password with missing fields
    console.log('🔐 Test 5: Reset password with missing fields');
    try {
      const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: 'some-token'
        // missing password
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n✅ API testing completed!');
    console.log('\n📝 Notes:');
    console.log('- Email service is in development mode (no real emails sent)');
    console.log('- Check server console for email content that would be sent');
    console.log('- To test with real emails, configure EMAIL_* variables in .env');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testForgotPasswordAPI();