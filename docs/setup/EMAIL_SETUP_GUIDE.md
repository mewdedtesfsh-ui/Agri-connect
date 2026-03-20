# Email Setup Guide for Forgot Password Functionality

## Overview
The AgriConnect platform includes a complete forgot password functionality that can send real password reset emails via Gmail SMTP.

## Current Status
✅ **Forgot Password API**: Fully implemented and working  
✅ **Database Schema**: Reset token columns added  
✅ **Frontend UI**: Login page with forgot password modal  
✅ **Reset Password Page**: Complete password reset interface  
✅ **Development Mode**: Working without real email configuration  

## Development Mode (Current)
When email credentials are not configured, the system operates in development mode:
- Password reset requests are processed normally
- Reset tokens are generated and stored in database
- Email content is logged to server console instead of being sent
- Reset URLs are displayed in server logs for testing

## Setting Up Real Gmail Integration

### Step 1: Gmail App Password Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification**
4. Scroll down to **App passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Environment Variables
Update your `backend/.env` file with your Gmail credentials:

```env
# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=AgriConnect <your-actual-email@gmail.com>
FRONTEND_URL=http://localhost:3002
```

### Step 3: Restart Backend Server
After updating the .env file:
```bash
cd backend
npm start
```

You should see: `✅ Email service ready - real emails will be sent`

## Testing the Functionality

### Frontend Testing
1. Go to `http://localhost:3002/login`
2. Click "Forgot your password?"
3. Enter a valid user email (e.g., `abebe@example.com`)
4. Check your Gmail inbox for the reset email
5. Click the reset link in the email
6. Enter a new password on the reset page

### API Testing
Use the provided test script:
```bash
cd backend
node scripts/test-forgot-password-api.js
```

### Available Test Users
The system includes these test users you can use:
- `abebe@example.com`
- `tigist@example.com`
- `dawit@example.com`

## Security Features

### Rate Limiting
- Forgot password requests: 5 per 15 minutes per IP
- General auth requests: 100 per 15 minutes per IP

### Token Security
- Reset tokens are cryptographically secure (32 random bytes)
- Tokens expire after 1 hour
- Tokens are single-use (cleared after password reset)
- Database indexes for efficient token lookup

### Privacy Protection
- API doesn't reveal whether an email exists in the system
- Same response for valid and invalid emails
- Detailed logging for debugging without exposing sensitive data

## Troubleshooting

### Common Issues

**"Username and Password not accepted"**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Factor Authentication is enabled on your Gmail account
- Check that EMAIL_USER and EMAIL_PASS are correctly set in .env

**"Email service not configured"**
- Verify all EMAIL_* variables are set in backend/.env
- Make sure EMAIL_USER is not the placeholder value
- Restart the backend server after changing .env

**Reset link not working**
- Check that FRONTEND_URL matches your frontend server URL
- Verify the reset token hasn't expired (1 hour limit)
- Ensure the ResetPassword component is properly routed in App.jsx

### Development vs Production

**Development Mode (Current)**
- No real emails sent
- Reset URLs logged to console
- Perfect for testing without email setup

**Production Mode**
- Real emails sent via Gmail SMTP
- Professional HTML email templates
- Proper error handling and logging

## Files Modified/Created

### Backend
- `backend/services/emailService.js` - Email service with Gmail integration
- `backend/routes/auth.js` - Forgot/reset password API endpoints
- `backend/config/db-schema.sql` - Added reset token columns
- `backend/migrations/003_add_password_reset.sql` - Migration script
- `backend/scripts/add-password-reset.js` - Migration runner
- `backend/scripts/test-forgot-password.js` - Database testing
- `backend/scripts/test-forgot-password-api.js` - API testing

### Frontend
- `frontend/src/pages/Login.jsx` - Added forgot password modal
- `frontend/src/pages/ResetPassword.jsx` - New password reset page
- `frontend/src/App.jsx` - Added reset password route

### Configuration
- `backend/.env.example` - Added email configuration template
- `backend/.env` - Added email configuration (with placeholders)

## Next Steps for Production

1. **Configure Real Gmail Credentials**: Follow the Gmail setup steps above
2. **Test Email Delivery**: Verify emails are received and links work
3. **Update Email Templates**: Customize the email design if needed
4. **Monitor Email Logs**: Check server logs for email delivery status
5. **Set Up Email Monitoring**: Consider using email delivery services for production

The forgot password functionality is now complete and ready for testing with real email integration!