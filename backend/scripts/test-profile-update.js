const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testProfileUpdate() {
  try {
    console.log('\n=== Testing Profile Update Flow ===\n');

    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'farmer@test.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✓ Login successful');
    console.log('User data from login:', JSON.stringify(user, null, 2));
    console.log('Profile photo from login:', user.profile_photo || 'null');

    // Step 2: Check if we have a test image
    const testImagePath = path.join(__dirname, '../../frontend/public/landingpagebackground.png');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('\n⚠ Test image not found. Skipping upload test.');
      console.log('Please upload a profile photo manually through the UI.');
      return;
    }

    // Step 3: Update profile with photo
    console.log('\nStep 2: Updating profile with photo...');
    
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('phone', user.phone || '+251900000000');
    formData.append('location', user.location || 'Test Location');
    formData.append('profile_photo', fs.createReadStream(testImagePath));

    const updateResponse = await axios.put(
      `${API_URL}/api/users/profile`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✓ Profile update successful');
    console.log('Updated user data:', JSON.stringify(updateResponse.data.user, null, 2));
    console.log('Profile photo after update:', updateResponse.data.user.profile_photo || 'null');

    // Step 4: Login again to verify persistence
    console.log('\nStep 3: Logging in again to verify persistence...');
    const secondLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'farmer@test.com',
      password: 'password123'
    });

    const secondUser = secondLoginResponse.data.user;
    console.log('✓ Second login successful');
    console.log('User data from second login:', JSON.stringify(secondUser, null, 2));
    console.log('Profile photo from second login:', secondUser.profile_photo || 'null');

    // Step 5: Verify
    if (secondUser.profile_photo) {
      console.log('\n✅ SUCCESS: Profile photo persists after logout/login!');
      console.log(`Photo URL: ${API_URL}/api/uploads/profiles/${secondUser.profile_photo}`);
    } else {
      console.log('\n❌ FAILURE: Profile photo was not persisted!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testProfileUpdate();
