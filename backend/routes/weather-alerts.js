const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

// Get all active weather alerts (optionally filtered by location)
router.get('/', authenticate, async (req, res) => {
  try {
    const { location } = req.query;
    
    let query = `
      SELECT * FROM weather_alerts 
      WHERE (expires_at IS NULL OR expires_at > NOW())
    `;
    const params = [];
    
    if (location) {
      query += ' AND location ILIKE $1';
      params.push(`%${location}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// Create weather alert (Admin only)
router.post('/',
  authenticate,
  authorize(['admin']),
  [
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('alert_type').isIn(['Heavy Rainfall', 'Flood Risk', 'Drought', 'Extreme Heat', 'Strong Winds'])
      .withMessage('Invalid alert type'),
    body('severity').isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity level'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('expires_at').optional().isISO8601().withMessage('Invalid expiration date')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { location, alert_type, severity, message, expires_at } = req.body;
      
      const result = await pool.query(
        `INSERT INTO weather_alerts (location, alert_type, severity, message, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [location, alert_type, severity, message, expires_at || null]
      );

      // Notify farmers in the affected location (includes SMS)
      const smsResults = await notificationService.notifyWeatherAlert(location, alert_type, severity, message);

      res.status(201).json({
        alert: result.rows[0],
        notifications: {
          inApp: smsResults.total,
          sms: {
            sent: smsResults.sent,
            failed: smsResults.failed,
            total: smsResults.total
          }
        }
      });
    } catch (error) {
      console.error('Error creating weather alert:', error);
      res.status(500).json({ error: 'Failed to create weather alert' });
    }
  }
);

// Delete weather alert (Admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM weather_alerts WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Weather alert not found' });
      }

      res.json({ message: 'Weather alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting weather alert:', error);
      res.status(500).json({ error: 'Failed to delete weather alert' });
    }
  }
);

module.exports = router;