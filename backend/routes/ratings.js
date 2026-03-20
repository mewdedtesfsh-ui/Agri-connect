const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, authorizeFarmer, authorizeExtensionOfficer } = require('../middleware/auth');
const ratingService = require('../services/ratingService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: true,
      message: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Rating submission validation
const ratingValidation = [
  body('articleId').isInt({ min: 1 }).withMessage('Valid article ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().isLength({ max: 1000 }).withMessage('Review must be 1000 characters or less')
];

// Article ID parameter validation
const articleIdValidation = [
  param('articleId').isInt({ min: 1 }).withMessage('Valid article ID is required')
];

// Pagination validation
const paginationValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be 0 or greater')
];

/**
 * POST /api/ratings
 * Submit or update a rating for an advice article
 * Requires farmer authentication
 */
router.post('/', 
  authenticateToken, 
  authorizeFarmer,
  ratingValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId, rating, review } = req.body;
      
      const result = await ratingService.submitRating(
        req.user.id, 
        articleId, 
        rating, 
        review
      );
      
      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Rating submission error:', error);
      
      // Handle specific error types
      if (error.message.includes('Rating must be between 1 and 5')) {
        return res.status(400).json({
          error: true,
          message: error.message,
          code: 'INVALID_RATING_RANGE'
        });
      }
      
      if (error.message.includes('Article not found')) {
        return res.status(404).json({
          error: true,
          message: error.message,
          code: 'ARTICLE_NOT_FOUND'
        });
      }
      
      if (error.message.includes('Only farmers can rate')) {
        return res.status(403).json({
          error: true,
          message: error.message,
          code: 'UNAUTHORIZED_ROLE'
        });
      }
      
      if (error.message.includes('Review must be') || error.message.includes('meaningful text')) {
        return res.status(400).json({
          error: true,
          message: error.message,
          code: 'INVALID_REVIEW_CONTENT'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Failed to submit rating',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * GET /api/ratings/article/:articleId
 * Get ratings and reviews for a specific article
 * Public endpoint (no authentication required)
 */
router.get('/article/:articleId',
  articleIdValidation,
  paginationValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      
      const result = await ratingService.getRatingsByArticle(articleId, limit, offset);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Get ratings error:', error);
      
      if (error.message.includes('Article not found')) {
        return res.status(404).json({
          error: true,
          message: error.message,
          code: 'ARTICLE_NOT_FOUND'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve ratings',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * GET /api/ratings/article/:articleId/user
 * Get the current user's rating for a specific article
 * Requires farmer authentication
 */
router.get('/article/:articleId/user',
  authenticateToken,
  authorizeFarmer,
  articleIdValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const result = await ratingService.getUserRating(req.user.id, articleId);
      
      if (!result) {
        return res.json({
          success: true,
          data: null,
          message: 'No rating found for this article'
        });
      }
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Get user rating error:', error);
      
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve user rating',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * PUT /api/ratings/article/:articleId/user
 * Update the current user's rating and review for a specific article
 * Requires farmer authentication
 */
router.put('/article/:articleId/user',
  authenticateToken,
  authorizeFarmer,
  articleIdValidation,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().isString().isLength({ max: 1000 }).withMessage('Review must be 1000 characters or less')
  ],
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      const { rating, review } = req.body;
      
      const result = await ratingService.updateRating(
        req.user.id, 
        articleId, 
        rating, 
        review
      );
      
      if (!result) {
        return res.status(404).json({
          error: true,
          message: 'No rating found to update',
          code: 'RATING_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Rating updated successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Update rating error:', error);
      
      if (error.message.includes('Rating must be between 1 and 5')) {
        return res.status(400).json({
          error: true,
          message: error.message,
          code: 'INVALID_RATING_RANGE'
        });
      }
      
      if (error.message.includes('Article not found')) {
        return res.status(404).json({
          error: true,
          message: error.message,
          code: 'ARTICLE_NOT_FOUND'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Failed to update rating',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * DELETE /api/ratings/article/:articleId/user
 * Delete the current user's rating for a specific article
 * Requires farmer authentication
 */
router.delete('/article/:articleId/user',
  authenticateToken,
  authorizeFarmer,
  articleIdValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const deleted = await ratingService.deleteRating(req.user.id, articleId);
      
      if (!deleted) {
        return res.status(404).json({
          error: true,
          message: 'No rating found to delete',
          code: 'RATING_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Rating deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete rating error:', error);
      
      res.status(500).json({
        error: true,
        message: 'Failed to delete rating',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * GET /api/ratings/stats/officer
 * Get rating statistics for the current extension officer
 * Requires extension officer authentication
 */
router.get('/stats/officer',
  authenticateToken,
  authorizeExtensionOfficer,
  async (req, res) => {
    try {
      const result = await ratingService.getOfficerRatingStats(req.user.id);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Get officer stats error:', error);
      
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve rating statistics',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * GET /api/ratings/article/:articleId/details
 * Get detailed rating analytics for a specific article
 * Requires extension officer authentication and article ownership
 */
router.get('/article/:articleId/details',
  authenticateToken,
  authorizeExtensionOfficer,
  articleIdValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const result = await ratingService.getArticleRatingDetails(articleId, req.user.id);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Get article details error:', error);
      
      if (error.message.includes('not found or unauthorized')) {
        return res.status(404).json({
          error: true,
          message: error.message,
          code: 'ARTICLE_NOT_FOUND_OR_UNAUTHORIZED'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve article rating details',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * GET /api/ratings/article/:articleId/stats
 * Get current rating statistics for an article (public endpoint)
 */
router.get('/article/:articleId/stats',
  articleIdValidation,
  validate,
  async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const result = await ratingService.calculateAverageRating(articleId);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Get rating stats error:', error);
      
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve rating statistics',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

module.exports = router;