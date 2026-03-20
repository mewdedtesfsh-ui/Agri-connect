# 🎯 START HERE - Twilio SMS Setup (10 Minutes)

## What You're Setting Up

Your AgriConnect platform will send **real SMS messages** to farmers' phones when you create weather alerts.

---

## 5 Simple Steps

### 1️⃣ Create Twilio Account (3 min)

🌐 Go to: **https://www.twilio.com/try-twilio**

- Click "Sign up"
- Enter email, password, name
- Verify email (check inbox)
- Verify phone (enter code)
- Answer quick questions (select SMS, Alerts, Node.js)

✅ **You get $15 free credit!**

---

### 2️⃣ Get Your Credentials (2 min)

You'll see the Twilio Console Dashboard.

**Copy these 3 things:**

1. **Account SID** (looks like: ACxxxxxxxx...)
2. **Auth Token** (click "Show" to reveal, then copy)
3. **Phone Number** (click "Get a Trial Number" button)

📝 **Keep these safe - you'll need them in the next step!**

---

### 3️⃣ Update Your .env File (2 min)

Open: `backend/.env`

Find this line:
```env
SMS_PROVIDER=twilio
```

Make sure it says `twilio`.

Then find these lines:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Replace with your actual values from Step 2:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

💾 **Save the file!**

---

### 4️⃣ Verify Your Phone Number (2 min)

Since you're using a free trial, you can only send SMS to verified numbers.

**Verify your own phone:**

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter your phone (e.g., +251912345678)
4. Choose "SMS" verification
5. Enter the code you receive

✅ **Done! Now you can send SMS to your phone.**

---

### 5️⃣ Test It! (1 min)

**Restart your backend:**
```bash
cd backend
npm start
```

**Send a test SMS:**
```bash
node scripts/send-test-sms.js
```

Enter your phone number when prompted.

📱 **Check your phone - you should receive an SMS!**

---

## ✅ That's It!

Your SMS system is now working. When an admin creates a weather alert, farmers will receive SMS notifications on their phones.

---

## 🎯 Quick Test via Admin Dashboard

1. Start frontend: `cd frontend && npm run dev`
2. Login as admin
3. Go to "Weather Alerts"
4. Create a test alert
5. Check your phone for SMS!

---

## 📚 More Help?

- **Complete guide:** See `SETUP_GUIDE.md` for detailed setup
- **Provider comparison:** See `PROVIDERS_COMPARISON.md`

---

## 🆘 Common Issues

**"SMS service not configured"**
→ Restart backend server after updating `.env`

**"Number is unverified"**
→ Verify the phone number in Twilio Console (Step 4)

**"Invalid phone number"**
→ Use format: +251912345678 (with + and country code)

---

## 💰 Cost

- **Trial:** $15 free credit (~500-1000 SMS)
- **Production:** ~$0.0075 per SMS (upgrade account)

---

**Ready? Start with Step 1! 🚀**

