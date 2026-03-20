const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin@gmail.com / admin@123...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin@123'
    });

    console.log('Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.log('Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

testLogin();
