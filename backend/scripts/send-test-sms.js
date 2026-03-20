require('dotenv').config();
const smsGateway = require('../services/smsGateway');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📱 Twilio SMS Test Tool\n');

// Check if Twilio is configured
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.log('❌ Twilio is not configured!');
  console.log('\nPlease add these to your backend/.env file:');
  console.log('TWILIO_ACCOUNT_SID=your_account_sid');
  console.log('TWILIO_AUTH_TOKEN=your_auth_token');
  console.log('TWILIO_PHONE_NUMBER=your_twilio_phone_number');
  process.exit(1);
}

console.log('✅ Twilio credentials found\n');

rl.question('Enter phone number to send test SMS (e.g., +251912345678): ', (phoneNumber) => {
  if (!phoneNumber.startsWith('+')) {
    console.log('\n❌ Phone number must be in international format (start with +)');
    console.log('Example: +251912345678 (Ethiopia)');
    rl.close();
    return;
  }

  const testMessage = 'AgriConnect Test: This is a test SMS from your weather alert system. If you receive this, SMS notifications are working correctly!';

  console.log(`\n📤 Sending test SMS to ${phoneNumber}...`);
  console.log(`Message: ${testMessage}\n`);

  smsGateway.sendSMS(phoneNumber, testMessage)
    .then(result => {
      if (result.success) {
        console.log('✅ SMS sent successfully!');
        console.log(`Message ID: ${result.messageId}`);
        console.log('\n💡 Check your phone for the SMS message.');
        console.log('If you don\'t receive it:');
        console.log('1. Verify the phone number is correct');
        console.log('2. Check if it\'s a verified number (for trial accounts)');
        console.log('3. Check Twilio Console logs: https://console.twilio.com/us1/monitor/logs/sms');
      } else {
        console.log('❌ Failed to send SMS');
        console.log(`Error: ${result.error}`);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. For trial accounts, verify the phone number at:');
        console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        console.log('2. Check your Twilio account balance');
        console.log('3. Verify phone number format (+country_code + number)');
        console.log('4. Check Twilio Console for more details');
      }
      rl.close();
    })
    .catch(error => {
      console.log('❌ Error sending SMS');
      console.log(`Error: ${error.message}`);
      rl.close();
    });
});
