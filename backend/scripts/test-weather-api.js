const axios = require('axios');
require('dotenv').config();

async function testWeatherAPI() {
  try {
    console.log('Testing OpenWeatherMap API...');
    console.log('API Key:', process.env.WEATHER_API_KEY);
    console.log('API URL:', process.env.WEATHER_API_URL);
    
    const response = await axios.get(
      `${process.env.WEATHER_API_URL}/weather`,
      {
        params: {
          q: 'Addis Ababa',
          appid: process.env.WEATHER_API_KEY,
          units: 'metric'
        }
      }
    );
    
    console.log('✓ API call successful!');
    console.log('Temperature:', response.data.main.temp);
    console.log('Weather:', response.data.weather[0].description);
  } catch (error) {
    console.error('✗ API call failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWeatherAPI();
