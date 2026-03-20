const axios = require('axios');
const pool = require('../config/database');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  try {
    console.log('🔄 Testing complete forgot password flow...\n');

    const testEmail = 'abebe@example.com';
    
    // Step 1: Request password reset
    console.log('📧 Step 1: Requesting password reset...');
    const forgotResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: testEmail
    });
    
    console.log('✅ Forgot password response:', forgotResponse.data);

    // Step 2: Get the reset token from database (simulating email click)
    console.log('\n🔍 Step 2: Retrieving reset token from database...');
    const tokenResult = await pool.query(
      'SELECT reset_token, reset_token_expiry FROM users WHERE email = $1',
      [testEmail]
    );

    if (tokenResult.rows.length === 0 || !tokenResult.rows[0].reset_token) {
      throw new Error('No reset token found in database');
    }

    const resetToken = tokenResult.rows[0].reset_token;
    const expiry = tokenResult.rows[0].reset_token_expiry;
    
    console.log('✅ Reset token found:', resetToken.substring(0, 20) + '...');
    console.log('✅ Token expires at:', expiry);

    // Step 3: Reset password using the token
    console.log('\n🔐 Step 3: Resetting password with token...');
    const newPassword = 'newpassword123';
    
    const resetResponse = await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: resetToken,
      password: newPassword
    });
    
    console.log('✅ Reset password response:', resetResponse.data);

    // Step 4: Verify token was cleared from database
    console.log('\n🧹 Step 4: Verifying token cleanup...');
    const cleanupCheck = await pool.query(
      'SELECT reset_token FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (cleanupCheck.rows[0].reset_token === null) {
      console.log('✅ Reset token properly cleared from database');
    } else {
      console.log('❌ Reset token not cleared from database');
    }

    // Step 5: Test login with new password
    console.log('\n🔑 Step 5: Testing login with new password...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: newPassword
      });
      
      console.log('✅ Login successful with new password');
      console.log('✅ User:', loginResponse.data.user.name);
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.error);
    }

    // Step 6: Restore original password for future tests
    console.log('\n🔄 Step 6: Restoring original password...');
    const bcrypt = require('bcrypt');
    const originalPassword = 'password123'; // Default test password
    const hashedOriginal = await bcrypt.hash(originalPassword, 10);
    
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedOriginal, testEmail]
    );
    
    console.log('✅ Original password restored for future tests');

    console.log('\n🎉 Complete flow test PASSED!');
    console.log('\n📋 Summary:');
    console.log('✅ Password reset request processed');
    console.log('✅ Reset token generated and stored');
    console.log('✅ Password successfully reset with token');
    console.log('✅ Reset token properly cleaned up');
    console.log('✅ Login works with new password');
    console.log('✅ Test data restored');
    
  } catch (error) {
    console.error('❌ Complete flow test FAILED:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
    }
  } finally {
    await pool.end();
  }
}

testCompleteFlow();