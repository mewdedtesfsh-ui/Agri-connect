const pool = require('../config/database');
const smsGateway = require('./smsGateway');

class NotificationService {
  // Create notification for a single user
  async createNotification(userId, type, message, link = null) {
    try {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, type, message, link)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, type, message, link]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for multiple users
  async createBulkNotifications(userIds, type, message, link = null) {
    try {
      const values = userIds.map((userId, index) => 
        `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
      ).join(', ');

      const params = userIds.flatMap(userId => [userId, type, message, link]);

      const query = `
        INSERT INTO notifications (user_id, type, message, link)
        VALUES ${values}
        RETURNING *
      `;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Notify all farmers about new advice
  async notifyNewAdvice(adviceId, title) {
    try {
      const farmersResult = await pool.query(
        "SELECT id FROM users WHERE role = 'farmer'"
      );
      
      const farmerIds = farmersResult.rows.map(row => row.id);
      
      if (farmerIds.length > 0) {
        await this.createBulkNotifications(
          farmerIds,
          'advice',
          `New farming advice: ${title}`,
          `/advice?article=${adviceId}`
        );
      }
    } catch (error) {
      console.error('Error notifying new advice:', error);
    }
  }

  // Notify farmers about weather alerts (location-based)
  async notifyWeatherAlert(location, alertType, severity, message) {
    try {
      const farmersResult = await pool.query(
        "SELECT id, phone, name FROM users WHERE role = 'farmer' AND location ILIKE $1",
        [`%${location}%`]
      );
      
      const farmerIds = farmersResult.rows.map(row => row.id);
      
      // Create in-app notifications
      if (farmerIds.length > 0) {
        await this.createBulkNotifications(
          farmerIds,
          'weather_alert',
          `${severity.toUpperCase()} Weather Alert: ${alertType} - ${message}`,
          `/dashboard`
        );
      }

      // Send SMS notifications to farmers with phone numbers
      const smsResults = {
        total: farmersResult.rows.length,
        sent: 0,
        failed: 0,
        errors: []
      };

      for (const farmer of farmersResult.rows) {
        if (farmer.phone) {
          // Format SMS message (keep it concise for SMS)
          const smsMessage = `AgriConnect Alert: ${severity.toUpperCase()} ${alertType} in ${location}. ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
          
          const result = await smsGateway.sendSMS(farmer.phone, smsMessage);
          
          if (result.success) {
            smsResults.sent++;
            
            // Log successful SMS
            await pool.query(
              `INSERT INTO sms_logs (phone_number, message, status, direction, user_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [farmer.phone, smsMessage, 'sent', 'outbound', farmer.id]
            );
          } else {
            smsResults.failed++;
            smsResults.errors.push({ phone: farmer.phone, error: result.error });
            
            // Log failed SMS
            await pool.query(
              `INSERT INTO sms_logs (phone_number, message, status, direction, user_id, error_message)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [farmer.phone, smsMessage, 'failed', 'outbound', farmer.id, result.error]
            );
          }
        }
      }

      console.log(`Weather Alert SMS Summary: ${smsResults.sent} sent, ${smsResults.failed} failed out of ${smsResults.total} farmers`);
      
      return smsResults;
    } catch (error) {
      console.error('Error notifying weather alert:', error);
      throw error;
    }
  }

  // Notify farmers about significant price changes
  async notifyPriceChange(cropName, marketName, oldPrice, newPrice) {
    try {
      const percentChange = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
      const direction = newPrice > oldPrice ? 'increased' : 'decreased';
      
      // Only notify if change is significant (>5%)
      if (Math.abs(percentChange) < 5) {
        return;
      }

      const farmersResult = await pool.query(
        "SELECT id FROM users WHERE role = 'farmer'"
      );
      
      const farmerIds = farmersResult.rows.map(row => row.id);
      
      if (farmerIds.length > 0) {
        await this.createBulkNotifications(
          farmerIds,
          'price_change',
          `${cropName} price ${direction} by ${Math.abs(percentChange)}% in ${marketName} (${oldPrice} → ${newPrice} ETB)`,
          `/prices`
        );
      }
    } catch (error) {
      console.error('Error notifying price change:', error);
    }
  }

  // Notify farmer when their question is answered
  async notifyQuestionAnswered(farmerId, questionId) {
    try {
      await this.createNotification(
        farmerId,
        'question_answered',
        'Your question has been answered by an extension officer',
        `/questions`
      );
    } catch (error) {
      console.error('Error notifying question answered:', error);
    }
  }
}

module.exports = new NotificationService();