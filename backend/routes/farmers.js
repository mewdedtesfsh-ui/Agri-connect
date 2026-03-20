const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all advice articles (farmers can view)
router.get('/advice', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as author_name, u.profile_photo as author_photo
      FROM advice_articles a
      JOIN users u ON a.extension_officer_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get advice error:', error);
    res.status(500).json({ error: 'Failed to retrieve advice articles' });
  }
});

// Get farmer's own questions
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*,
             (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
      FROM farmer_questions q
      WHERE q.farmer_id = $1
      ORDER BY q.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// Post a question
router.post('/questions',
  authenticateToken,
  [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('category').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { question, category } = req.body;
      const result = await pool.query(
        'INSERT INTO farmer_questions (farmer_id, question, category) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, question, category]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Post question error:', error);
      res.status(500).json({ error: 'Failed to post question' });
    }
  }
);

// Get answers for a specific question
router.get('/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the question belongs to the farmer
    const questionCheck = await pool.query(
      'SELECT id FROM farmer_questions WHERE id = $1 AND farmer_id = $2',
      [id, req.user.id]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await pool.query(`
      SELECT a.*, u.name as officer_name
      FROM answers a
      JOIN users u ON a.extension_officer_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.created_at ASC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ error: 'Failed to retrieve answers' });
  }
});

module.exports = router;
