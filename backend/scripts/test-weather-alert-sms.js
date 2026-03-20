const axios = require('axios');

// Test weather alert SMS notification
async function testWeatherAlertSMS() {
  try {
    console.log('🧪 Testing Weather Alert SMS Notification...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@agriconnect.et',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');

    // Create a weather alert
    console.log('2. Creating weather alert...');
    const alertData = {
      location: 'Addis Ababa',
      alert_type: 'Heavy Rainfall',
      severity: 'high',
      message: 'Heavy rainfall expected in the next 24 hours. Please take necessary precautions to protect your crops.',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    const alertResponse = await axios.post(
      'http://localhost:5000/api/weather-alerts',
      alertData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Weather alert created successfully!');
    console.log('\n📊 Notification Results:');
    console.log('Alert ID:', alertResponse.data.alert.id);
    console.log('Location:', alertResponse.data.alert.location);
    console.log('Alert Type:', alertResponse.data.alert.alert_type);
    console.log('Severity:', alertResponse.data.alert.severity);
    
    if (alertResponse.data.notifications) {
      const { inApp, sms } = alertResponse.data.notifications;
      console.log('\n📱 SMS Notifications:');
      console.log(`  - Total farmers in location: ${sms.total}`);
      console.log(`  - SMS sent successfully: ${sms.sent}`);
      console.log(`  - SMS failed: ${sms.failed}`);
      console.log(`  - In-app notifications: ${inApp}`);
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 Tips:');
    console.log('  - Check SMS logs in the admin panel');
    console.log('  - Verify farmers received in-app notifications');
    console.log('  - If SMS failed, check Twilio configuration in .env');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testWeatherAlertSMS();
