const axios = require('axios');

class SMSGateway {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
  }

  async sendSMS(phoneNumber, message) {
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else {
        console.log(`[SMS SIMULATION] To: ${phoneNumber}, Message: ${message}`);
        return { success: true, provider: 'simulation' };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendViaTwilio(phoneNumber, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.log('[SMS SIMULATION - Twilio not configured]');
      console.log(`To: ${phoneNumber}`);
      console.log(`Message: ${message}`);
      return { success: true, provider: 'simulation' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const response = await axios.post(
      url,
      new URLSearchParams({
        To: phoneNumber,
        From: fromNumber,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        }
      }
    );

    return { success: true, provider: 'twilio', messageId: response.data.sid };
  }

}

module.exports = new SMSGateway();