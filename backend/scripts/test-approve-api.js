const axios = require('axios');

async function testApproveAPI() {
  try {
    // First login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Admin logged in');
    
    // Get officer ID
    const usersResponse = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const officer = usersResponse.data.find(u => u.email === 'officer@gmail.com');
    console.log('Officer found:', officer);
    
    if (officer) {
      // Test approve endpoint
      const approveResponse = await axios.patch(
        `http://localhost:5000/api/users/${officer.id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ Approve response:', approveResponse.data);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApproveAPI();
