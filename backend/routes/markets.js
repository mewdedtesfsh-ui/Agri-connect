const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeExtensionOfficer } = require('../middleware/auth');
const { marketValidation, validate } = require('../middleware/validator');

// Get all markets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM markets ORDER BY region ASC, name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get markets error:', error);
    res.status(500).json({ error: 'Failed to retrieve markets' });
  }
});

// Create market (Extension Officer only)
router.post('/', authenticateToken, authorizeExtensionOfficer, marketValidation, validate, async (req, res) => {
  try {
    const { name, region } = req.body;

    const result = await pool.query(
      'INSERT INTO markets (name, region) VALUES ($1, $2) RETURNING *',
      [name, region]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Market already exists in this region' });
    }
    console.error('Create market error:', error);
    res.status(500).json({ error: 'Failed to create market' });
  }
});

// Update market (Extension Officer only)
router.patch('/:id', authenticateToken, authorizeExtensionOfficer, marketValidation, validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region } = req.body;

    const result = await pool.query(
      'UPDATE markets SET name = $1, region = $2 WHERE id = $3 RETURNING *',
      [name, region, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update market error:', error);
    res.status(500).json({ error: 'Failed to update market' });
  }
});

// Delete market (Extension Officer only)
router.delete('/:id', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM markets WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }

    res.json({ message: 'Market deleted successfully' });
  } catch (error) {
    console.error('Delete market error:', error);
    res.status(500).json({ error: 'Failed to delete market' });
  }
});

module.exports = router;
