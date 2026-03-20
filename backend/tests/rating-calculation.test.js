const pool = require('../config/database');
const ratingService = require('../services/ratingService');

describe('Rating Calculation Service Tests', () => {
  let testArticleId;
  let testFarmerId1;
  let testFarmerId2;
  let testFarmerId3;
  let testOfficerId;

  beforeAll(async () => {
    const officerResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Officer Calc', 'officer-calc@test.com', '1234567894', 'hashedpass', 'extension_officer', 'approved']
    );
    testOfficerId = officerResult.rows[0].id;

    const farmer1Result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Farmer 1', 'farmer1-calc@test.com', '1234567895', 'hashedpass', 'farmer', 'approved']
    );
    testFarmerId1 = farmer1Result.rows[0].id;

    const farmer2Result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Farmer 2', 'farmer2-calc@test.com', '1234567896', 'hashedpass', 'farmer', 'approved']
    );
    testFarmerId2 = farmer2Result.rows[0].id;

    const farmer3Result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Farmer 3', 'farmer3-calc@test.com', '1234567897', 'hashedpass', 'farmer', 'approved']
    );
    testFarmerId3 = farmer3Result.rows[0].id;

    const articleResult = await pool.query(
      `INSERT INTO advice_articles (extension_officer_id, title, content, category) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testOfficerId, 'Test Article Calc', 'Test content', 'general']
    );
    testArticleId = articleResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM advice_ratings WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_reviews WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_articles WHERE id = $1', [testArticleId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3, $4)', 
      [testFarmerId1, testFarmerId2, testFarmerId3, testOfficerId]);
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM advice_ratings WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_reviews WHERE article_id = $1', [testArticleId]);
    await pool.query(
      'UPDATE advice_articles SET average_rating = 0, review_count = 0 WHERE id = $1',
      [testArticleId]
    );
  });

  describe('Average Rating Calculation', () => {
    test('should calculate average rating correctly for single rating', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 4);
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(4.0);
      expect(stats.ratingCount).toBe(1);
    });

    test('should calculate average rating correctly for multiple ratings', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5);
      await ratingService.submitRating(testFarmerId2, testArticleId, 3);
      await ratingService.submitRating(testFarmerId3, testArticleId, 4);
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(4.0);
      expect(stats.ratingCount).toBe(3);
    });

    test('should round average rating to one decimal place', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5);
      await ratingService.submitRating(testFarmerId2, testArticleId, 4);
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(4.5);
      expect(stats.ratingCount).toBe(2);
    });

    test('should handle rating updates in average calculation', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 2);
      let stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(2.0);
      await ratingService.submitRating(testFarmerId1, testArticleId, 5);
      stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(5.0);
      expect(stats.ratingCount).toBe(1);
    });

    test('should return 0 for articles with no ratings', async () => {
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(0);
      expect(stats.ratingCount).toBe(0);
    });
  });

  describe('Review Count Maintenance', () => {
    test('should maintain correct review count when adding reviews', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5, 'Great advice!');
      let stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(1);
      await ratingService.submitRating(testFarmerId2, testArticleId, 4, 'Very helpful');
      stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(2);
    });

    test('should maintain correct review count when updating reviews', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5, 'Initial review');
      let stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(1);
      await ratingService.submitRating(testFarmerId1, testArticleId, 4, 'Updated review');
      stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(1);
    });

    test('should maintain correct review count when deleting reviews', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5, 'Review to delete');
      await ratingService.submitRating(testFarmerId2, testArticleId, 4, 'Another review');
      let stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(2);
      await ratingService.deleteRating(testFarmerId1, testArticleId);
      stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.reviewCount).toBe(1);
    });

    test('should handle ratings without reviews correctly', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5);
      await ratingService.submitRating(testFarmerId2, testArticleId, 4, 'With review');
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.ratingCount).toBe(2);
      expect(stats.reviewCount).toBe(1);
    });
  });

  describe('Article Stats Update', () => {
    test('should update article table with correct statistics', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5, 'Excellent');
      await ratingService.submitRating(testFarmerId2, testArticleId, 4, 'Good');
      const result = await pool.query(
        'SELECT average_rating, review_count FROM advice_articles WHERE id = $1',
        [testArticleId]
      );
      expect(parseFloat(result.rows[0].average_rating)).toBe(4.5);
      expect(parseInt(result.rows[0].review_count)).toBe(2);
    });

    test('should update article stats immediately after rating submission', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 3);
      const result = await pool.query(
        'SELECT average_rating, review_count FROM advice_articles WHERE id = $1',
        [testArticleId]
      );
      expect(parseFloat(result.rows[0].average_rating)).toBe(3.0);
      expect(parseInt(result.rows[0].review_count)).toBe(0);
    });

    test('should update article stats after rating deletion', async () => {
      await ratingService.submitRating(testFarmerId1, testArticleId, 5);
      await ratingService.submitRating(testFarmerId2, testArticleId, 3);
      await ratingService.deleteRating(testFarmerId1, testArticleId);
      const result = await pool.query(
        'SELECT average_rating, review_count FROM advice_articles WHERE id = $1',
        [testArticleId]
      );
      expect(parseFloat(result.rows[0].average_rating)).toBe(3.0);
      expect(parseInt(result.rows[0].review_count)).toBe(0);
    });
  });

  describe('Concurrent Rating Updates', () => {
    test('should handle concurrent rating submissions correctly', async () => {
      const promises = [
        ratingService.submitRating(testFarmerId1, testArticleId, 5),
        ratingService.submitRating(testFarmerId2, testArticleId, 4),
        ratingService.submitRating(testFarmerId3, testArticleId, 3)
      ];
      await Promise.all(promises);
      const ratings = await ratingService.getRatingsByArticle(testArticleId);
      expect(ratings.ratings).toHaveLength(3);
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.averageRating).toBe(4.0);
      expect(stats.ratingCount).toBe(3);
      const result = await pool.query(
        'SELECT average_rating, review_count FROM advice_articles WHERE id = $1',
        [testArticleId]
      );
      expect(parseFloat(result.rows[0].average_rating)).toBe(4.0);
    });

    test('should handle concurrent submissions with reviews correctly', async () => {
      const promises = [
        ratingService.submitRating(testFarmerId1, testArticleId, 5, 'Great advice!'),
        ratingService.submitRating(testFarmerId2, testArticleId, 4, 'Very helpful'),
        ratingService.submitRating(testFarmerId3, testArticleId, 3, 'Good information')
      ];
      await Promise.all(promises);
      const stats = await ratingService.calculateAverageRating(testArticleId);
      expect(stats.ratingCount).toBe(3);
      expect(stats.reviewCount).toBe(3);
      const result = await pool.query(
        'SELECT average_rating, review_count FROM advice_articles WHERE id = $1',
        [testArticleId]
      );
      expect(parseFloat(result.rows[0].average_rating)).toBe(4.0);
      expect(parseInt(result.rows[0].review_count)).toBe(3);
    });
  });
});
