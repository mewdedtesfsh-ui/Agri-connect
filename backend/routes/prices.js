const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeExtensionOfficer } = require('../middleware/auth');
const { priceValidation, validate } = require('../middleware/validator');

// Get all prices with crop and market details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.price, p.date_updated,
        c.id as crop_id, c.name as crop_name, c.category as crop_category,
        m.id as market_id, m.name as market_name, m.region as market_region
      FROM prices p
      JOIN crops c ON p.crop_id = c.id
      JOIN markets m ON p.market_id = m.id
      ORDER BY p.date_updated DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: 'Failed to retrieve prices' });
  }
});

// Create or update price (Extension Officer only)
router.post('/', authenticateToken, authorizeExtensionOfficer, priceValidation, validate, async (req, res) => {
  try {
    const { crop_id, market_id, price } = req.body;

    // Check if price exists for today
    const existing = await pool.query(
      `SELECT id FROM prices 
       WHERE crop_id = $1 AND market_id = $2 
       AND DATE(date_updated) = CURRENT_DATE`,
      [crop_id, market_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing price
      result = await pool.query(
        'UPDATE prices SET price = $1, date_updated = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [price, existing.rows[0].id]
      );
    } else {
      // Create new price
      result = await pool.query(
        'INSERT INTO prices (crop_id, market_id, price) VALUES ($1, $2, $3) RETURNING *',
        [crop_id, market_id, price]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create price error:', error);
    res.status(500).json({ error: 'Failed to create price' });
  }
});

// Update price (Extension Officer only)
router.patch('/:id', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const result = await pool.query(
      'UPDATE prices SET price = $1, date_updated = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// Delete price (Extension Officer only)
router.delete('/:id', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM prices WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Price not found' });
    }

    res.json({ message: 'Price deleted successfully' });
  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ error: 'Failed to delete price' });
  }
});

module.exports = router;
