require('dotenv').config();
const twilio = require('twilio');

console.log('🔍 Verifying Twilio SMS Configuration...\n');

// Check environment variables
console.log('1. Checking environment variables:');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid) {
  console.log('   ❌ TWILIO_ACCOUNT_SID is not set');
} else {
  console.log(`   ✅ TWILIO_ACCOUNT_SID: ${accountSid.substring(0, 10)}...`);
}

if (!authToken) {
  console.log('   ❌ TWILIO_AUTH_TOKEN is not set');
} else {
  console.log(`   ✅ TWILIO_AUTH_TOKEN: ${authToken.substring(0, 10)}...`);
}

if (!phoneNumber) {
  console.log('   ❌ TWILIO_PHONE_NUMBER is not set');
} else {
  console.log(`   ✅ TWILIO_PHONE_NUMBER: ${phoneNumber}`);
}

if (!accountSid || !authToken || !phoneNumber) {
  console.log('\n❌ Twilio is NOT configured properly.');
  console.log('\n📝 To configure Twilio:');
  console.log('1. Sign up at https://www.twilio.com/try-twilio');
  console.log('2. Get your Account SID and Auth Token from the Console');
  console.log('3. Get a phone number from Twilio');
  console.log('4. Add these to your backend/.env file:');
  console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('   TWILIO_AUTH_TOKEN=your_auth_token_here');
  console.log('   TWILIO_PHONE_NUMBER=+1234567890');
  console.log('5. Restart your backend server');
  process.exit(1);
}

// Test Twilio connection
console.log('\n2. Testing Twilio connection:');
try {
  const client = twilio(accountSid, authToken);
  
  // Try to fetch account info
  client.api.accounts(accountSid)
    .fetch()
    .then(account => {
      console.log('   ✅ Successfully connected to Twilio!');
      console.log(`   Account Status: ${account.status}`);
      console.log(`   Account Type: ${account.type}`);
      
      // Fetch phone numbers
      return client.incomingPhoneNumbers.list({ limit: 20 });
    })
    .then(phoneNumbers => {
      console.log(`\n3. Available phone numbers: ${phoneNumbers.length}`);
      phoneNumbers.forEach(number => {
        console.log(`   - ${number.phoneNumber} (${number.friendlyName})`);
      });
      
      console.log('\n✅ Twilio is configured correctly!');
      console.log('\n📱 SMS notifications will be sent when weather alerts are created.');
      console.log('\n💡 Next steps:');
      console.log('1. Ensure farmers have phone numbers in international format (+251...)');
      console.log('2. Create a weather alert as admin');
      console.log('3. Check SMS logs in the admin panel');
      console.log('4. Verify farmers receive SMS on their phones');
      
      if (account.type === 'Trial') {
        console.log('\n⚠️  Note: You are using a TRIAL account');
        console.log('   - Can only send SMS to verified phone numbers');
        console.log('   - Messages include "Sent from your Twilio trial account"');
        console.log('   - Verify phone numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        console.log('   - Upgrade to send to any number: https://console.twilio.com/billing');
      }
    })
    .catch(error => {
      console.log('   ❌ Failed to connect to Twilio');
      console.log(`   Error: ${error.message}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify your Account SID and Auth Token are correct');
      console.log('2. Check if your Twilio account is active');
      console.log('3. Ensure you have internet connection');
      console.log('4. Visit Twilio Console: https://console.twilio.com');
    });
} catch (error) {
  console.log('   ❌ Error initializing Twilio client');
  console.log(`   Error: ${error.message}`);
}
