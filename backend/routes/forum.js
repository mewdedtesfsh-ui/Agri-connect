const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all forum posts
router.get('/posts', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        fp.*,
        u.name as author_name,
        u.role as author_role
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      ORDER BY fp.is_pinned DESC, fp.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch forum posts' });
  }
});

// Get single post with comments
router.get('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const postResult = await pool.query(`
      SELECT 
        fp.*,
        u.name as author_name,
        u.role as author_role
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1
    `, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsResult = await pool.query(`
      SELECT 
        fc.*,
        u.name as author_name,
        u.role as author_role
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = $1
      ORDER BY fc.created_at ASC
    `, [id]);

    const likesResult = await pool.query(
      'SELECT user_id FROM forum_post_likes WHERE post_id = $1',
      [id]
    );

    res.json({
      post: postResult.rows[0],
      comments: commentsResult.rows,
      likes: likesResult.rows.map(row => row.user_id)
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create forum post
router.post('/posts',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      const result = await pool.query(
        `INSERT INTO forum_posts (user_id, title, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, title, content]
      );

      const postWithAuthor = await pool.query(`
        SELECT 
          fp.*,
          u.name as author_name,
          u.role as author_role
        FROM forum_posts fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.id = $1
      `, [result.rows[0].id]);

      res.status(201).json(postWithAuthor.rows[0]);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

// Create comment
router.post('/comments',
  authenticate,
  [
    body('post_id').isInt().withMessage('Valid post ID is required'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { post_id, comment } = req.body;
      const userId = req.user.id;

      const commentResult = await client.query(
        `INSERT INTO forum_comments (post_id, user_id, comment)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [post_id, userId, comment]
      );

      await client.query(
        'UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = $1',
        [post_id]
      );

      await client.query('COMMIT');

      const commentWithAuthor = await pool.query(`
        SELECT 
          fc.*,
          u.name as author_name,
          u.role as author_role
        FROM forum_comments fc
        JOIN users u ON fc.user_id = u.id
        WHERE fc.id = $1
      `, [commentResult.rows[0].id]);

      res.status(201).json(commentWithAuthor.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    } finally {
      client.release();
    }
  }
);

// Toggle like on post
router.post('/posts/:id/like', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await client.query(
      'SELECT * FROM forum_post_likes WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      await client.query(
        'DELETE FROM forum_post_likes WHERE post_id = $1 AND user_id = $2',
        [id, userId]
      );
      await client.query(
        'UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = $1',
        [id]
      );
    } else {
      await client.query(
        'INSERT INTO forum_post_likes (post_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      await client.query(
        'UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
    }

    await client.query('COMMIT');

    const postResult = await pool.query(
      'SELECT likes_count FROM forum_posts WHERE id = $1',
      [id]
    );

    res.json({ likes_count: postResult.rows[0].likes_count });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  } finally {
    client.release();
  }
});

// Pin/unpin post (Extension officers only)
router.patch('/posts/:id/pin',
  authenticate,
  authorize(['extension_officer', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_pinned } = req.body;

      const result = await pool.query(
        'UPDATE forum_posts SET is_pinned = $1 WHERE id = $2 RETURNING *',
        [is_pinned, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error pinning post:', error);
      res.status(500).json({ error: 'Failed to pin post' });
    }
  }
);

// Delete post (Author or Extension officer/Admin)
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const postResult = await pool.query(
      'SELECT user_id FROM forum_posts WHERE id = $1',
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAuthor = postResult.rows[0].user_id === userId;
    const isModerator = ['extension_officer', 'admin'].includes(userRole);

    if (!isAuthor && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await pool.query('DELETE FROM forum_posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;