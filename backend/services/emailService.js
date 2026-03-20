const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    // Try to use configured SMTP first
    if (process.env.EMAIL_HOST && 
        process.env.EMAIL_USER && 
        process.env.EMAIL_PASS &&
        process.env.EMAIL_USER !== 'your-email@gmail.com' &&
        process.env.EMAIL_PASS !== 'your-app-password' &&
        process.env.EMAIL_PASS !== 'NEED_APP_PASSWORD_HERE') {
      
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify connection configuration
      try {
        await this.transporter.verify();
        console.log('✅ Email service ready - real emails will be sent');
        return;
      } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.log('🔄 Falling back to test email service...');
      }
    }

    // Fallback to Ethereal Email (test service that works like real email)
    try {
      console.log('🔄 Setting up test email service...');
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.testMode = true;
      console.log('✅ Test email service ready - emails will be sent to test inbox');
      console.log('📧 Test email credentials:', testAccount.user, '/', testAccount.pass);
      console.log('🌐 View emails at: https://ethereal.email/');
    } catch (error) {
      console.error('❌ Failed to set up test email service:', error.message);
      console.log('⚠️  Using development mode - emails will be logged only');
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"AgriConnect" <${process.env.EMAIL_FROM || 'noreply@agriconnect.et'}>`,
      to: email,
      subject: 'Reset Your AgriConnect Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .logo { font-size: 24px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌾 AgriConnect</div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your AgriConnect password. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you're having trouble with the button above, you can also reset your password by:</p>
              <ol>
                <li>Going to the AgriConnect login page</li>
                <li>Clicking "Forgot password?"</li>
                <li>Entering your email address</li>
              </ol>
              
              <p>Best regards,<br><strong>The AgriConnect Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message from AgriConnect. Please do not reply to this email.</p>
              <p>If you need help, contact our support team at info@agriconnect.et</p>
              <p>© 2024 AgriConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        AgriConnect - Password Reset Request
        
        Hello,
        
        We received a request to reset your AgriConnect password. If you made this request, visit the following link to reset your password:
        
        ${resetUrl}
        
        Important Security Information:
        - This link will expire in 1 hour for security reasons
        - If you didn't request this password reset, please ignore this email
        - Your password will remain unchanged until you create a new one
        - Never share this link with anyone
        
        If you're having trouble with the link above, you can also reset your password by going to the AgriConnect login page and clicking "Forgot password?"
        
        Best regards,
        The AgriConnect Team
        
        This is an automated message from AgriConnect. Please do not reply to this email.
        If you need help, contact our support team at info@agriconnect.et
      `
    };

    try {
      if (!this.transporter) {
        // Development mode - log the email content
        console.log('\n=== 📧 EMAIL WOULD BE SENT ===');
        console.log('To:', email);
        console.log('Subject:', mailOptions.subject);
        console.log('Reset URL:', resetUrl);
        console.log('Token:', resetToken);
        console.log('========================\n');
        return { success: true, mode: 'development', resetUrl, resetToken };
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      if (this.testMode) {
        console.log('✅ Test email sent to:', email);
        console.log('📧 Message ID:', info.messageId);
        console.log('🌐 View email at:', nodemailer.getTestMessageUrl(info));
        console.log('📬 Email preview URL:', nodemailer.getTestMessageUrl(info));
        return { 
          success: true, 
          messageId: info.messageId, 
          mode: 'test',
          previewUrl: nodemailer.getTestMessageUrl(info)
        };
      } else {
        console.log('✅ Password reset email sent to:', email);
        console.log('📧 Message ID:', info.messageId);
        console.log('🔗 Reset URL:', resetUrl);
        console.log('🎫 Reset Token:', resetToken);
        return { success: true, messageId: info.messageId, mode: 'production' };
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();