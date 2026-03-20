const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'officer@gmail.com',
      password: 'password123'
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Login blocked:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
