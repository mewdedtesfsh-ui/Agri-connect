const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, location, approval_status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get pending extension officers (Admin only)
router.get('/pending-officers', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, location, created_at 
       FROM users 
       WHERE role = 'extension_officer' AND approval_status = 'pending'
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending officers error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending officers' });
  }
});

// Approve extension officer (Admin only)
router.patch('/:id/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'approved' 
       WHERE id = $1 AND role = 'extension_officer'
       RETURNING id, name, email, approval_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Extension officer not found' });
    }

    res.json({ message: 'Extension officer approved', user: result.rows[0] });
  } catch (error) {
    console.error('Approve officer error:', error);
    res.status(500).json({ error: 'Failed to approve officer' });
  }
});

// Ban user (Admin only)
router.patch('/:id/ban', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from banning themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban your own account' });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'banned' 
       WHERE id = $1
       RETURNING id, name, email, role, approval_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User banned successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban user (Admin only)
router.patch('/:id/unban', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'approved' 
       WHERE id = $1
       RETURNING id, name, email, role, approval_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User unbanned successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
