const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeExtensionOfficer } = require('../middleware/auth');
const { cropValidation, validate } = require('../middleware/validator');

// Get all crops
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crops ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: 'Failed to retrieve crops' });
  }
});

// Create crop (Extension Officer only)
router.post('/', authenticateToken, authorizeExtensionOfficer, cropValidation, validate, async (req, res) => {
  try {
    const { name, category } = req.body;

    const result = await pool.query(
      'INSERT INTO crops (name, category) VALUES ($1, $2) RETURNING *',
      [name, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Crop already exists' });
    }
    console.error('Create crop error:', error);
    res.status(500).json({ error: 'Failed to create crop' });
  }
});

// Update crop (Extension Officer only)
router.patch('/:id', authenticateToken, authorizeExtensionOfficer, cropValidation, validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const result = await pool.query(
      'UPDATE crops SET name = $1, category = $2 WHERE id = $3 RETURNING *',
      [name, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// Delete crop (Extension Officer only)
router.delete('/:id', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM crops WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

module.exports = router;
