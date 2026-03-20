const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const smsCommandParser = require('../services/smsCommandParser');
const smsGateway = require('../services/smsGateway');

// Webhook endpoint for receiving SMS (from SMS gateway)
router.post('/webhook', async (req, res) => {
  try {
    // Different SMS providers send data in different formats
    // This handles Twilio format
    const phoneNumber = req.body.From || req.body.from || req.body.phoneNumber;
    const messageIn = req.body.Body || req.body.text || req.body.message;

    if (!phoneNumber || !messageIn) {
      return res.status(400).json({ error: 'Missing phone number or message' });
    }

    // Log incoming SMS
    const logResult = await pool.query(
      `INSERT INTO sms_logs (phone_number, message_in, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [phoneNumber, messageIn]
    );

    const logId = logResult.rows[0].id;

    // Parse command and generate response
    const messageOut = await smsCommandParser.parseAndExecute(messageIn, phoneNumber);
    
    // Determine command type
    const commandType = messageIn.trim().toUpperCase().split(' ')[0];

    // Send SMS response
    await smsGateway.sendSMS(phoneNumber, messageOut);

    // Update log with response
    await pool.query(
      `UPDATE sms_logs 
       SET message_out = $1, command_type = $2, status = 'processed', processed_at = NOW()
       WHERE id = $3`,
      [messageOut, commandType, logId]
    );

    // Respond to webhook (format depends on provider)
    res.status(200).json({ success: true, message: 'SMS processed' });
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    res.status(500).json({ error: 'Failed to process SMS' });
  }
});

// Manual SMS sending endpoint (for testing)
router.post('/send',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { phone_number, message } = req.body;

      if (!phone_number || !message) {
        return res.status(400).json({ error: 'Phone number and message required' });
      }

      // Log outgoing SMS
      const logResult = await pool.query(
        `INSERT INTO sms_logs (phone_number, message_out, command_type, status)
         VALUES ($1, $2, 'MANUAL', 'pending')
         RETURNING id`,
        [phone_number, message]
      );

      const logId = logResult.rows[0].id;

      // Send SMS
      const result = await smsGateway.sendSMS(phone_number, message);

      // Update log
      await pool.query(
        `UPDATE sms_logs 
         SET status = 'processed', processed_at = NOW()
         WHERE id = $1`,
        [logId]
      );

      res.json({ success: true, result });
    } catch (error) {
      console.error('Error sending SMS:', error);
      res.status(500).json({ error: 'Failed to send SMS' });
    }
  }
);

// Test SMS command (for testing without actual SMS)
router.post('/test',
  authenticate,
  async (req, res) => {
    try {
      const { message, phone_number } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message required' });
      }

      const response = await smsCommandParser.parseAndExecute(
        message, 
        phone_number || 'TEST'
      );

      res.json({ 
        input: message, 
        output: response 
      });
    } catch (error) {
      console.error('Error testing SMS command:', error);
      res.status(500).json({ error: 'Failed to test command' });
    }
  }
);

// Get SMS logs (Admin only)
router.get('/logs',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const result = await pool.query(
        `SELECT * FROM sms_logs 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await pool.query('SELECT COUNT(*) FROM sms_logs');
      const total = parseInt(countResult.rows[0].count);

      res.json({
        logs: result.rows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      res.status(500).json({ error: 'Failed to fetch SMS logs' });
    }
  }
);

// Get SMS statistics (Admin only)
router.get('/stats',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const statsResult = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'processed') as processed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COUNT(*) FILTER (WHERE command_type = 'PRICE') as price_queries,
          COUNT(*) FILTER (WHERE command_type = 'WEATHER') as weather_queries,
          COUNT(DISTINCT phone_number) as unique_users
        FROM sms_logs
      `);

      res.json(statsResult.rows[0]);
    } catch (error) {
      console.error('Error fetching SMS stats:', error);
      res.status(500).json({ error: 'Failed to fetch SMS stats' });
    }
  }
);

module.exports = router;