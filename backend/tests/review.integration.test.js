const request = require('supertest');
const app = require('../server');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

describe('Review Integration Tests', () => {
  let testArticleId;
  let testFarmerId;
  let testOfficerId;
  let farmerToken;

  beforeAll(async () => {
    // Create test extension officer
    const officerResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Officer Integration', 'officer-integration@test.com', '1234567892', 'hashedpass', 'extension_officer', 'approved']
    );
    testOfficerId = officerResult.rows[0].id;

    // Create test farmer
    const farmerResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Farmer Integration', 'farmer-integration@test.com', '1234567893', 'hashedpass', 'farmer', 'approved']
    );
    testFarmerId = farmerResult.rows[0].id;

    // Create JWT token for farmer
    farmerToken = jwt.sign(
      { id: testFarmerId, role: 'farmer' },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );

    // Create test article
    const articleResult = await pool.query(
      `INSERT INTO advice_articles (extension_officer_id, title, content, category) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testOfficerId, 'Test Article', 'Test content', 'general']
    );
    testArticleId = articleResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM advice_ratings WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_reviews WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_articles WHERE id = $1', [testArticleId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [testFarmerId, testOfficerId]);
  });

  beforeEach(async () => {
    // Clean ratings between tests
    await pool.query('DELETE FROM advice_ratings WHERE article_id = $1', [testArticleId]);
    await pool.query('DELETE FROM advice_reviews WHERE article_id = $1', [testArticleId]);
  });

  test('should submit rating with review successfully', async () => {
    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 5,
        review: 'This is an excellent advice article that helped me a lot!'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rating).toBe(5);
    expect(response.body.data.review).toBe('This is an excellent advice article that helped me a lot!');
  });

  test('should retrieve reviews with ratings', async () => {
    // First submit a rating with review
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 4,
        review: 'Good advice, very helpful for my farming practices.'
      });

    // Then retrieve the ratings
    const response = await request(app)
      .get(`/api/ratings/article/${testArticleId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.averageRating).toBe(4);
    expect(response.body.data.reviewCount).toBe(1);
    expect(response.body.data.ratings).toHaveLength(1);
    expect(response.body.data.ratings[0].review).toBe('Good advice, very helpful for my farming practices.');
    expect(response.body.data.ratings[0].rating).toBe(4);
  });

  test('should handle review validation errors', async () => {
    // Test empty review (should be accepted)
    const emptyReviewResponse = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 3,
        review: ''
      });

    expect(emptyReviewResponse.status).toBe(201);
    expect(emptyReviewResponse.body.data.review).toBeNull();

    // Test review too long (caught by express-validator)
    const longReview = 'a'.repeat(1001);
    const longReviewResponse = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 3,
        review: longReview
      });

    expect(longReviewResponse.status).toBe(400);
    expect(longReviewResponse.body.error).toBe(true);
    expect(longReviewResponse.body.message).toBe('Validation failed');

    // Test review with only numbers/special characters (caught by service)
    const invalidReviewResponse = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 3,
        review: '12345!@#$%'
      });

    expect(invalidReviewResponse.status).toBe(400);
    expect(invalidReviewResponse.body.error).toBe(true);
    expect(invalidReviewResponse.body.code).toBe('INVALID_REVIEW_CONTENT');
  });

  test('should update existing review', async () => {
    // Submit initial review
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 3,
        review: 'Initial review text'
      });

    // Update the review
    const updateResponse = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 4,
        review: 'Updated review text with more details'
      });

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.data.rating).toBe(4);
    expect(updateResponse.body.data.review).toBe('Updated review text with more details');

    // Verify only one review exists
    const getResponse = await request(app)
      .get(`/api/ratings/article/${testArticleId}`);

    expect(getResponse.body.data.ratings).toHaveLength(1);
    expect(getResponse.body.data.ratings[0].review).toBe('Updated review text with more details');
  });

  test('should get user specific review', async () => {
    // Submit a review
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 5,
        review: 'My personal review of this article'
      });

    // Get user's specific review
    const response = await request(app)
      .get(`/api/ratings/article/${testArticleId}/user`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rating).toBe(5);
    expect(response.body.data.review).toBe('My personal review of this article');
  });

  test('should delete user review and rating', async () => {
    // Submit a review
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        articleId: testArticleId,
        rating: 2,
        review: 'Review to be deleted'
      });

    // Delete the review
    const deleteResponse = await request(app)
      .delete(`/api/ratings/article/${testArticleId}/user`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Verify review is deleted
    const getResponse = await request(app)
      .get(`/api/ratings/article/${testArticleId}`);

    expect(getResponse.body.data.ratings).toHaveLength(0);
    expect(getResponse.body.data.reviewCount).toBe(0);
  });
});