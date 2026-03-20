const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeExtensionOfficer } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/media';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|ogg/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  // More permissive mimetype check
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAudio = file.mimetype.startsWith('audio/');
  
  if (extname && (isImage || isVideo || isAudio)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and audio files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: fileFilter
});

// Get extension officer dashboard stats
router.get('/dashboard', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const [articlesCount, questionsCount, answersCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM advice_articles WHERE extension_officer_id = $1', [req.user.id]),
      pool.query('SELECT COUNT(*) FROM farmer_questions WHERE status = $1', ['pending']),
      pool.query('SELECT COUNT(*) FROM answers WHERE extension_officer_id = $1', [req.user.id])
    ]);

    res.json({
      totalArticles: parseInt(articlesCount.rows[0].count),
      pendingQuestions: parseInt(questionsCount.rows[0].count),
      totalAnswers: parseInt(answersCount.rows[0].count)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

// Get all advice articles
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

// Create advice article with optional media
router.post('/advice', 
  authenticateToken, 
  authorizeExtensionOfficer,
  (req, res, next) => {
    upload.single('media')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 100MB' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, category } = req.body;
      let media_type = 'none';
      let media_url = null;

      if (req.file) {
        media_url = `/api/uploads/media/${req.file.filename}`;
        
        // Determine media type from mimetype
        if (req.file.mimetype.startsWith('image/')) {
          media_type = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
          media_type = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
          media_type = 'audio';
        }
      }

      const result = await pool.query(
        'INSERT INTO advice_articles (extension_officer_id, title, content, category, media_type, media_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [req.user.id, title, content, category, media_type, media_url]
      );
      
      // Notify all farmers about new advice
      await notificationService.notifyNewAdvice(result.rows[0].id, title);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create advice error:', error);
      // Clean up uploaded file if database insert fails
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'media', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ error: 'Failed to create advice article' });
    }
  }
);

// Update advice article with optional media
router.patch('/advice/:id',
  authenticateToken,
  authorizeExtensionOfficer,
  (req, res, next) => {
    upload.single('media')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 100MB' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category, removeMedia } = req.body;

      // Get existing article to check for old media
      const existing = await pool.query(
        'SELECT * FROM advice_articles WHERE id = $1 AND extension_officer_id = $2',
        [id, req.user.id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found or unauthorized' });
      }

      let media_type = existing.rows[0].media_type;
      let media_url = existing.rows[0].media_url;

      // Handle media removal
      if (removeMedia === 'true') {
        if (media_url) {
          const oldFilePath = path.join(__dirname, '..', media_url.replace('/api/uploads/', 'uploads/'));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        media_type = 'none';
        media_url = null;
      }

      // Handle new media upload
      if (req.file) {
        // Delete old media file if exists
        if (media_url) {
          const oldFilePath = path.join(__dirname, '..', media_url.replace('/api/uploads/', 'uploads/'));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        media_url = `/api/uploads/media/${req.file.filename}`;
        
        if (req.file.mimetype.startsWith('image/')) {
          media_type = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
          media_type = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
          media_type = 'audio';
        }
      }

      const result = await pool.query(
        `UPDATE advice_articles 
         SET title = $1, content = $2, category = $3, media_type = $4, media_url = $5, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $6 AND extension_officer_id = $7 
         RETURNING *`,
        [title, content, category, media_type, media_url, id, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update advice error:', error);
      // Clean up uploaded file if update fails
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'media', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ error: 'Failed to update advice article' });
    }
  }
);

// Delete advice article
router.delete('/advice/:id', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get article to find media file
    const article = await pool.query(
      'SELECT media_url FROM advice_articles WHERE id = $1 AND extension_officer_id = $2',
      [id, req.user.id]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or unauthorized' });
    }

    // Delete media file if exists
    if (article.rows[0].media_url) {
      const filePath = path.join(__dirname, '..', article.rows[0].media_url.replace('/api/uploads/', 'uploads/'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete article from database
    await pool.query(
      'DELETE FROM advice_articles WHERE id = $1 AND extension_officer_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete advice error:', error);
    res.status(500).json({ error: 'Failed to delete advice article' });
  }
});

// Get all questions
router.get('/questions', authenticateToken, authorizeExtensionOfficer, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, u.name as farmer_name, u.location as farmer_location,
             (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
      FROM farmer_questions q
      JOIN users u ON q.farmer_id = u.id
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// Get answers for a question
router.get('/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
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

// Post answer to question
router.post('/answers',
  authenticateToken,
  authorizeExtensionOfficer,
  [body('question_id').isInt().withMessage('Valid question ID is required'),
   body('answer').trim().notEmpty().withMessage('Answer is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { question_id, answer } = req.body;

      // Insert answer
      const result = await pool.query(
        'INSERT INTO answers (question_id, extension_officer_id, answer) VALUES ($1, $2, $3) RETURNING *',
        [question_id, req.user.id, answer]
      );

      // Update question status to answered
      await pool.query(
        'UPDATE farmer_questions SET status = $1 WHERE id = $2',
        ['answered', question_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Post answer error:', error);
      res.status(500).json({ error: 'Failed to post answer' });
    }
  }
);

module.exports = router;
