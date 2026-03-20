# SMS Documentation

## 📚 Quick Navigation

### 🚀 Getting Started

**New to SMS setup?** Start here:

1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** ⭐ **START HERE**
   - Complete setup guide for both providers
   - Step-by-step instructions
   - Troubleshooting
   - Testing guide

### 📖 Provider-Specific Guides

2. **[TWILIO_SETUP.md](TWILIO_SETUP.md)**
   - Quick 10-minute Twilio setup
   - Best for testing and global reach
   - Includes trial account setup

### 📊 Comparison & Planning

3. **[PROVIDERS_COMPARISON.md](PROVIDERS_COMPARISON.md)**
   - Compare all SMS providers
   - Pricing information
   - Feature comparison
   - Recommendations

---

## 🎯 Which Guide Should I Use?

### I'm just starting → `SETUP_GUIDE.md`
Complete guide covering everything you need.

### I want to use Twilio → `TWILIO_SETUP.md`
Quick Twilio-specific setup (10 minutes).

### I'm comparing providers → `PROVIDERS_COMPARISON.md`
See all options and make an informed choice.

---

## 🔧 Technical Reference

### Service Files
- `backend/services/smsGateway.js` - Main SMS service
- `backend/services/notificationService.js` - Notification system (uses SMS)

### Configuration
- `backend/.env` - SMS configuration
- `backend/.env.example` - Configuration template

### Test Scripts
- `backend/scripts/send-test-sms.js` - Send test SMS
- `backend/scripts/verify-twilio-setup.js` - Verify Twilio setup

---

## ✅ Setup Checklist

- [ ] Read `SETUP_GUIDE.md`
- [ ] Choose provider (Twilio)
- [ ] Create account with chosen provider
- [ ] Get credentials
- [ ] Update `backend/.env`
- [ ] Restart backend server
- [ ] Test with `send-test-sms.js`
- [ ] Verify SMS received on phone

---

## 🆘 Troubleshooting

All troubleshooting information is in:
- `SETUP_GUIDE.md` - General troubleshooting
- `TWILIO_SETUP.md` - Twilio-specific issues

---

**Total setup time: ~10 minutes**

**Questions?** Check the relevant guide above or the troubleshooting sections.

