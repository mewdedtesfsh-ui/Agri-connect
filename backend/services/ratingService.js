const pool = require('../config/database');

class RatingService {
  /**
   * Submit or update a rating for an advice article
   * @param {number} userId - The farmer's user ID
   * @param {number} articleId - The advice article ID
   * @param {number} rating - Rating value (1-5)
   * @param {string} review - Optional review text
   * @returns {Promise<Object>} Rating data with user information
   */
  async submitRating(userId, articleId, rating, review = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Validate rating range
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }
      
      // Validate article exists
      const articleCheck = await client.query(
        'SELECT id FROM advice_articles WHERE id = $1',
        [articleId]
      );
      
      if (articleCheck.rows.length === 0) {
        throw new Error('Article not found');
      }
      
      // Validate user is a farmer
      const userCheck = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'farmer') {
        throw new Error('Only farmers can rate advice articles');
      }
      
      // Check if rating already exists
      const existingRating = await client.query(
        'SELECT id FROM advice_ratings WHERE article_id = $1 AND farmer_id = $2',
        [articleId, userId]
      );
      
      let ratingResult;
      
      if (existingRating.rows.length > 0) {
        // Update existing rating
        ratingResult = await client.query(
          `UPDATE advice_ratings 
           SET rating = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE article_id = $2 AND farmer_id = $3 
           RETURNING *`,
          [rating, articleId, userId]
        );
      } else {
        // Insert new rating
        ratingResult = await client.query(
          `INSERT INTO advice_ratings (article_id, farmer_id, rating) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [articleId, userId, rating]
        );
      }
      
      // Handle review if provided
      let reviewResult = null;
      if (review && review.trim().length > 0) {
        // Validate review length
        if (review.length > 1000) {
          throw new Error('Review must be 1000 characters or less');
        }
        
        // Validate review content (not just special characters or numbers)
        const trimmedReview = review.trim();
        if (!/[a-zA-Z]/.test(trimmedReview)) {
          throw new Error('Review must contain meaningful text');
        }
        
        const existingReview = await client.query(
          'SELECT id FROM advice_reviews WHERE article_id = $1 AND farmer_id = $2',
          [articleId, userId]
        );
        
        if (existingReview.rows.length > 0) {
          // Update existing review
          reviewResult = await client.query(
            `UPDATE advice_reviews 
             SET review_text = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE article_id = $2 AND farmer_id = $3 
             RETURNING *`,
            [trimmedReview, articleId, userId]
          );
        } else {
          // Insert new review
          reviewResult = await client.query(
            `INSERT INTO advice_reviews (article_id, farmer_id, review_text) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [articleId, userId, trimmedReview]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Update cached rating statistics in article table
      // This ensures Requirements 4.1, 4.2, 4.3 are met
      await this.updateArticleRatingStats(articleId);
      
      // Get updated rating data with user information
      const result = await this.getRatingWithUserInfo(ratingResult.rows[0].id);
      
      return {
        ...result,
        review: reviewResult ? reviewResult.rows[0].review_text : null
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get ratings for a specific article with pagination
   * @param {number} articleId - The advice article ID
   * @param {number} limit - Number of ratings to return (default: 20)
   * @param {number} offset - Number of ratings to skip (default: 0)
   * @returns {Promise<Object>} Rating statistics and individual ratings
   */
  async getRatingsByArticle(articleId, limit = 20, offset = 0) {
    try {
      // Get article rating statistics
      const statsResult = await pool.query(
        `SELECT average_rating, review_count 
         FROM advice_articles 
         WHERE id = $1`,
        [articleId]
      );
      
      if (statsResult.rows.length === 0) {
        throw new Error('Article not found');
      }
      
      const stats = statsResult.rows[0];
      
      // Get individual ratings and reviews with user information
      const ratingsResult = await pool.query(
        `SELECT 
           r.id, r.rating, r.created_at, r.updated_at,
           rv.review_text,
           u.name as farmer_name
         FROM advice_ratings r
         JOIN users u ON r.farmer_id = u.id
         LEFT JOIN advice_reviews rv ON rv.article_id = r.article_id AND rv.farmer_id = r.farmer_id
         WHERE r.article_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [articleId, limit, offset]
      );
      
      return {
        averageRating: parseFloat(stats.average_rating) || 0,
        reviewCount: parseInt(stats.review_count) || 0,
        ratings: ratingsResult.rows.map(row => ({
          id: row.id,
          rating: row.rating,
          review: row.review_text,
          farmerName: row.farmer_name,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }))
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get a specific user's rating for an article
   * @param {number} userId - The farmer's user ID
   * @param {number} articleId - The advice article ID
   * @returns {Promise<Object|null>} User's rating and review, or null if not found
   */
  async getUserRating(userId, articleId) {
    try {
      const result = await pool.query(
        `SELECT 
           r.rating, r.created_at, r.updated_at,
           rv.review_text
         FROM advice_ratings r
         LEFT JOIN advice_reviews rv ON rv.article_id = r.article_id AND rv.farmer_id = r.farmer_id
         WHERE r.article_id = $1 AND r.farmer_id = $2`,
        [articleId, userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        rating: row.rating,
        review: row.review_text,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update a user's rating and review for an article
   * @param {number} userId - The farmer's user ID
   * @param {number} articleId - The advice article ID
   * @param {number} rating - Rating value (1-5)
   * @param {string} review - Optional review text
   * @returns {Promise<Object|null>} Updated rating data, or null if not found
   */
  async updateRating(userId, articleId, rating, review = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Validate rating range
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }
      
      // Validate article exists
      const articleCheck = await client.query(
        'SELECT id FROM advice_articles WHERE id = $1',
        [articleId]
      );
      
      if (articleCheck.rows.length === 0) {
        throw new Error('Article not found');
      }
      
      // Check if rating exists
      const existingRating = await client.query(
        'SELECT id FROM advice_ratings WHERE article_id = $1 AND farmer_id = $2',
        [articleId, userId]
      );
      
      if (existingRating.rows.length === 0) {
        return null; // No rating to update
      }
      
      // Update rating
      const ratingResult = await client.query(
        `UPDATE advice_ratings 
         SET rating = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE article_id = $2 AND farmer_id = $3 
         RETURNING *`,
        [rating, articleId, userId]
      );
      
      // Handle review update
      let reviewResult = null;
      if (review !== null) {
        if (review.trim().length > 0) {
          // Validate review length
          if (review.length > 1000) {
            throw new Error('Review must be 1000 characters or less');
          }
          
          // Validate review content
          const trimmedReview = review.trim();
          if (!/[a-zA-Z]/.test(trimmedReview)) {
            throw new Error('Review must contain meaningful text');
          }
          
          const existingReview = await client.query(
            'SELECT id FROM advice_reviews WHERE article_id = $1 AND farmer_id = $2',
            [articleId, userId]
          );
          
          if (existingReview.rows.length > 0) {
            // Update existing review
            reviewResult = await client.query(
              `UPDATE advice_reviews 
               SET review_text = $1, updated_at = CURRENT_TIMESTAMP 
               WHERE article_id = $2 AND farmer_id = $3 
               RETURNING *`,
              [trimmedReview, articleId, userId]
            );
          } else {
            // Insert new review
            reviewResult = await client.query(
              `INSERT INTO advice_reviews (article_id, farmer_id, review_text) 
               VALUES ($1, $2, $3) 
               RETURNING *`,
              [articleId, userId, trimmedReview]
            );
          }
        } else {
          // Empty review - delete existing review if any
          await client.query(
            'DELETE FROM advice_reviews WHERE article_id = $1 AND farmer_id = $2',
            [articleId, userId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Update cached rating statistics
      await this.updateArticleRatingStats(articleId);
      
      // Get updated rating data with user information
      const result = await this.getRatingWithUserInfo(ratingResult.rows[0].id);
      
      return {
        ...result,
        review: reviewResult ? reviewResult.rows[0].review_text : null
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete a user's rating and review for an article
   * @param {number} userId - The farmer's user ID
   * @param {number} articleId - The advice article ID
   * @returns {Promise<boolean>} True if rating was deleted, false if not found
   */
  async deleteRating(userId, articleId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete review first (if exists)
      await client.query(
        'DELETE FROM advice_reviews WHERE article_id = $1 AND farmer_id = $2',
        [articleId, userId]
      );
      
      // Delete rating
      const result = await client.query(
        'DELETE FROM advice_ratings WHERE article_id = $1 AND farmer_id = $2',
        [articleId, userId]
      );
      
      await client.query('COMMIT');
      
      // Update cached rating statistics in article table
      // This ensures Requirements 4.3 is met (review count maintenance)
      if (result.rowCount > 0) {
        await this.updateArticleRatingStats(articleId);
      }
      
      return result.rowCount > 0;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Calculate and return the current average rating for an article
   * Rounds to one decimal place as per Requirement 4.2
   * @param {number} articleId - The advice article ID
   * @returns {Promise<Object>} Current rating statistics
   */
  async calculateAverageRating(articleId) {
    try {
      const result = await pool.query(
        `SELECT 
           COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
           COUNT(*) as rating_count
         FROM advice_ratings 
         WHERE article_id = $1`,
        [articleId]
      );
      
      const reviewCountResult = await pool.query(
        'SELECT COUNT(*) as review_count FROM advice_reviews WHERE article_id = $1',
        [articleId]
      );
      
      return {
        averageRating: parseFloat(result.rows[0].average_rating),
        ratingCount: parseInt(result.rows[0].rating_count),
        reviewCount: parseInt(reviewCountResult.rows[0].review_count)
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update the cached rating statistics in the advice_articles table
   * Handles concurrent updates safely using database transactions
   * @param {number} articleId - The advice article ID
   * @param {Object} client - Optional database client for transaction context
   * @returns {Promise<Object>} Updated rating statistics
   */
  async updateArticleRatingStats(articleId, client = null) {
    const dbClient = client || pool;
    
    try {
      // Calculate current statistics
      const stats = await this.calculateAverageRating(articleId);
      
      // Update the article table with new statistics
      // Using ROUND to ensure one decimal place as per Requirement 4.2
      await dbClient.query(
        `UPDATE advice_articles 
         SET 
           average_rating = ROUND($1::numeric, 1),
           review_count = $2
         WHERE id = $3`,
        [stats.averageRating, stats.reviewCount, articleId]
      );
      
      return stats;
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get rating statistics for an extension officer
   * @param {number} officerId - The extension officer's user ID
   * @returns {Promise<Object>} Officer's rating statistics and recent reviews
   */
  async getOfficerRatingStats(officerId) {
    try {
      // Get overall statistics for officer's articles
      const overallStats = await pool.query(
        `SELECT 
           COUNT(DISTINCT a.id) as total_articles,
           COALESCE(AVG(a.average_rating), 0) as overall_average_rating,
           COALESCE(SUM(a.review_count), 0) as total_reviews
         FROM advice_articles a
         WHERE a.extension_officer_id = $1`,
        [officerId]
      );
      
      // Get individual article statistics
      const articleStats = await pool.query(
        `SELECT 
           a.id, a.title, a.average_rating, a.review_count, a.created_at
         FROM advice_articles a
         WHERE a.extension_officer_id = $1
         ORDER BY a.created_at DESC`,
        [officerId]
      );
      
      // Get recent reviews for officer's articles
      const recentReviews = await pool.query(
        `SELECT 
           rv.review_text, rv.created_at,
           r.rating,
           u.name as farmer_name,
           a.title as article_title,
           a.id as article_id
         FROM advice_reviews rv
         JOIN advice_ratings r ON rv.article_id = r.article_id AND rv.farmer_id = r.farmer_id
         JOIN users u ON rv.farmer_id = u.id
         JOIN advice_articles a ON rv.article_id = a.id
         WHERE a.extension_officer_id = $1
         ORDER BY rv.created_at DESC
         LIMIT 10`,
        [officerId]
      );
      
      const stats = overallStats.rows[0];
      
      return {
        totalArticles: parseInt(stats.total_articles),
        overallAverageRating: parseFloat(stats.overall_average_rating) || 0,
        totalReviews: parseInt(stats.total_reviews),
        articleStats: articleStats.rows.map(row => ({
          id: row.id,
          title: row.title,
          averageRating: parseFloat(row.average_rating) || 0,
          reviewCount: parseInt(row.review_count) || 0,
          createdAt: row.created_at
        })),
        recentReviews: recentReviews.rows.map(row => ({
          reviewText: row.review_text,
          rating: row.rating,
          farmerName: row.farmer_name,
          articleTitle: row.article_title,
          articleId: row.article_id,
          createdAt: row.created_at
        }))
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get detailed rating information for a specific article (for analytics)
   * @param {number} articleId - The advice article ID
   * @param {number} officerId - The extension officer's user ID (for authorization)
   * @returns {Promise<Object>} Detailed rating analytics
   */
  async getArticleRatingDetails(articleId, officerId) {
    try {
      // Verify officer owns the article
      const articleCheck = await pool.query(
        'SELECT id, title FROM advice_articles WHERE id = $1 AND extension_officer_id = $2',
        [articleId, officerId]
      );
      
      if (articleCheck.rows.length === 0) {
        throw new Error('Article not found or unauthorized');
      }
      
      // Get rating distribution
      const ratingDistribution = await pool.query(
        `SELECT 
           rating,
           COUNT(*) as count
         FROM advice_ratings 
         WHERE article_id = $1
         GROUP BY rating
         ORDER BY rating`,
        [articleId]
      );
      
      // Get all ratings with reviews and farmer info
      const detailedRatings = await pool.query(
        `SELECT 
           r.rating, r.created_at as rating_date,
           rv.review_text, rv.created_at as review_date,
           u.name as farmer_name, u.location as farmer_location
         FROM advice_ratings r
         JOIN users u ON r.farmer_id = u.id
         LEFT JOIN advice_reviews rv ON rv.article_id = r.article_id AND rv.farmer_id = r.farmer_id
         WHERE r.article_id = $1
         ORDER BY r.created_at DESC`,
        [articleId]
      );
      
      // Calculate statistics
      const stats = await this.calculateAverageRating(articleId);
      
      // Build rating distribution object
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingDistribution.rows.forEach(row => {
        distribution[row.rating] = parseInt(row.count);
      });
      
      return {
        article: {
          id: articleCheck.rows[0].id,
          title: articleCheck.rows[0].title
        },
        statistics: {
          averageRating: stats.averageRating,
          ratingCount: stats.ratingCount,
          reviewCount: stats.reviewCount,
          ratingDistribution: distribution
        },
        ratings: detailedRatings.rows.map(row => ({
          rating: row.rating,
          ratingDate: row.rating_date,
          review: row.review_text,
          reviewDate: row.review_date,
          farmerName: row.farmer_name,
          farmerLocation: row.farmer_location
        }))
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Helper method to get rating with user information
   * @private
   */
  async getRatingWithUserInfo(ratingId) {
    const result = await pool.query(
      `SELECT 
         r.id, r.article_id, r.farmer_id, r.rating, r.created_at, r.updated_at,
         u.name as farmer_name
       FROM advice_ratings r
       JOIN users u ON r.farmer_id = u.id
       WHERE r.id = $1`,
      [ratingId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Rating not found');
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      articleId: row.article_id,
      farmerId: row.farmer_id,
      rating: row.rating,
      farmerName: row.farmer_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = new RatingService();