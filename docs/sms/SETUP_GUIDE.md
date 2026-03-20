# SMS Setup Guide for AgriConnect

## Overview

AgriConnect supports SMS notifications for weather alerts using Twilio for global coverage.

---

## Quick Start - Twilio Setup

### Step 1: Create Twilio Account (3 minutes)

1. Go to: **https://www.twilio.com/try-twilio**
2. Sign up (free account)
3. Verify your email and phone number
4. **You get $15 free credit!** (~500-1000 SMS)

### Step 2: Get Your Credentials (2 minutes)

After logging in to Twilio Console:

1. **Account SID** - Copy from dashboard (starts with "AC")
2. **Auth Token** - Click "Show" to reveal, then copy
3. **Phone Number** - Click "Get a Trial Number" button

### Step 3: Configure Your Backend (2 minutes)

Open `backend/.env` and update:

```env
# Change SMS provider to Twilio
SMS_PROVIDER=twilio

# Add your Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Save the file!**

### Step 4: Verify Test Phone Number (2 minutes)

For trial accounts, you can only send SMS to verified numbers:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter your phone number (e.g., +251912345678)
4. Verify via SMS code

### Step 5: Test It! (1 minute)

```bash
# Restart backend
cd backend
npm start

# Send test SMS
node scripts/send-test-sms.js
```

Enter your verified phone number and check your phone!

---

## Phone Number Format

All phone numbers MUST be in international format:

✅ **Correct:**
- `+251912345678` (Ethiopia)
- `+254712345678` (Kenya)
- `+256712345678` (Uganda)

❌ **Wrong:**
- `0912345678` (missing country code)
- `912345678` (missing +)

---

## How It Works

1. Admin creates a weather alert
2. System finds all farmers in that location
3. SMS sent to each farmer's phone number
4. Delivery tracked in database
5. Admin sees success stats

---

## Cost Information

### Twilio
- **Trial:** $15 free credit (~500-1000 SMS)
- **Production:** ~$0.0075 per SMS
- **Coverage:** Global reach

---

## Troubleshooting

### "SMS service not configured"
→ Add credentials to `.env` and restart backend

### "Number is unverified" (Twilio trial)
→ Verify phone number in Twilio Console

### "Invalid phone number"
→ Use international format: +251912345678

### SMS not received
1. Check credentials are correct
2. Restart backend after updating `.env`
3. Verify phone number format
4. Check provider console logs

---

## Testing

### Test via Script
```bash
cd backend
node scripts/send-test-sms.js
```

### Test via Admin Dashboard
1. Login as admin
2. Go to Weather Alerts
3. Create a test alert
4. Check your phone for SMS

---

## Files Reference

### Service Files
- `backend/services/smsGateway.js` - Main SMS service

### Configuration
- `backend/.env` - SMS provider configuration
- `backend/.env.example` - Configuration template

### Test Scripts
- `backend/scripts/send-test-sms.js` - Send test SMS
- `backend/scripts/verify-twilio-setup.js` - Verify Twilio configuration

---

## Additional Documentation

- **TWILIO_SETUP.md** - Detailed Twilio setup with screenshots
- **PROVIDERS_COMPARISON.md** - Comparison of SMS providers

---

## Quick Checklist

Before testing:

- [ ] Created Twilio account
- [ ] Got credentials (Account SID, Auth Token, Phone Number)
- [ ] Updated `backend/.env` with credentials
- [ ] Set `SMS_PROVIDER=twilio`
- [ ] Saved `.env` file
- [ ] Restarted backend server
- [ ] Verified test phone number (for Twilio trial)
- [ ] Tested with `send-test-sms.js` script
- [ ] Received SMS on phone

---

**Setup time: ~10 minutes**

**Questions?** Check the troubleshooting section or provider documentation.

