const fc = require('fast-check');
const pool = require('../config/database');
const ratingService = require('../services/ratingService');

describe('Rating System Property Tests', () => {
  let testArticleId;
  let testFarmerId;
  let testOfficerId;

  beforeAll(async () => {
    // Create test extension officer
    const officerResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Officer', 'officer@test.com', '1234567890', 'hashedpass', 'extension_officer', 'approved']
    );
    testOfficerId = officerResult.rows[0].id;

    // Create test farmer
    const farmerResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Farmer', 'farmer@test.com', '1234567891', 'hashedpass', 'farmer', 'approved']
    );
    testFarmerId = farmerResult.rows[0].id;

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

  // Feature: advice-rating-system, Property 1: Star Rating Submission
  // **Validates: Requirements 1.2, 1.3**
  test('Property 1: Star Rating Submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Valid rating range
        async (rating) => {
          // Submit rating
          const result = await ratingService.submitRating(testFarmerId, testArticleId, rating);
          
          // Verify rating was stored correctly
          expect(result.rating).toBe(rating);
          expect(result.articleId).toBe(testArticleId);
          expect(result.farmerId).toBe(testFarmerId);
          
          // Verify no duplicate ratings allowed
          await expect(
            ratingService.submitRating(testFarmerId, testArticleId, rating)
          ).resolves.toBeDefined(); // Should update, not create duplicate
          
          // Verify only one rating exists
          const ratings = await ratingService.getRatingsByArticle(testArticleId);
          expect(ratings.ratings).toHaveLength(1);
        }
      ),
      { numRuns: 20 }
    );
  });
  // Feature: advice-rating-system, Property 2: Rating State Display and Updates
  // **Validates: Requirements 1.4, 1.5**
  test('Property 2: Rating State Display and Updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Initial rating
        fc.integer({ min: 1, max: 5 }), // Updated rating
        async (initialRating, updatedRating) => {
          // Submit initial rating
          await ratingService.submitRating(testFarmerId, testArticleId, initialRating);
          
          // Verify initial rating is displayed
          const userRating1 = await ratingService.getUserRating(testFarmerId, testArticleId);
          expect(userRating1.rating).toBe(initialRating);
          
          // Update rating
          await ratingService.submitRating(testFarmerId, testArticleId, updatedRating);
          
          // Verify updated rating is displayed
          const userRating2 = await ratingService.getUserRating(testFarmerId, testArticleId);
          expect(userRating2.rating).toBe(updatedRating);
          
          // Verify still only one rating exists
          const ratings = await ratingService.getRatingsByArticle(testArticleId);
          expect(ratings.ratings).toHaveLength(1);
          expect(ratings.ratings[0].rating).toBe(updatedRating);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Feature: advice-rating-system, Property 3: Review Text Validation
  // **Validates: Requirements 2.2, 5.1, 5.2, 5.3**
  test('Property 3: Review Text Validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Rating
        fc.oneof(
          // Valid reviews
          fc.string({ minLength: 1, maxLength: 1000 }).filter(s => 
            s.trim().length > 0 && /[a-zA-Z]/.test(s.trim())
          ),
          // Invalid reviews - empty or whitespace only
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t\n  ')
          ),
          // Invalid reviews - only special characters or numbers
          fc.oneof(
            fc.constant('123456'),
            fc.constant('!@#$%^&*()'),
            fc.constant('123!@#')
          ),
          // Invalid reviews - too long
          fc.string({ minLength: 1001, maxLength: 1500 })
        ),
        async (rating, reviewText) => {
          const trimmedReview = reviewText.trim();
          
          if (reviewText.length > 1000) {
            // Should reject reviews over 1000 characters
            await expect(
              ratingService.submitRating(testFarmerId, testArticleId, rating, reviewText)
            ).rejects.toThrow('Review must be 1000 characters or less');
          } else if (trimmedReview.length === 0) {
            // Should accept rating without review when review is empty/whitespace
            const result = await ratingService.submitRating(testFarmerId, testArticleId, rating, reviewText);
            expect(result.rating).toBe(rating);
            expect(result.review).toBeNull();
          } else if (!/[a-zA-Z]/.test(trimmedReview)) {
            // Should reject reviews with only special characters or numbers
            await expect(
              ratingService.submitRating(testFarmerId, testArticleId, rating, reviewText)
            ).rejects.toThrow('Review must contain meaningful text');
          } else {
            // Should accept valid reviews with proper trimming
            const result = await ratingService.submitRating(testFarmerId, testArticleId, rating, reviewText);
            expect(result.rating).toBe(rating);
            expect(result.review).toBe(trimmedReview);
            
            // Verify review is stored correctly
            const userRating = await ratingService.getUserRating(testFarmerId, testArticleId);
            expect(userRating.review).toBe(trimmedReview);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // Feature: advice-rating-system, Property 4: Review Storage and Uniqueness
  // **Validates: Requirements 2.3, 2.4, 2.5**
  test('Property 4: Review Storage and Uniqueness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Rating
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => 
          s.trim().length > 0 && /[a-zA-Z]/.test(s.trim())
        ), // Valid review text
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => 
          s.trim().length > 0 && /[a-zA-Z]/.test(s.trim())
        ), // Updated review text
        async (rating, initialReview, updatedReview) => {
          // Submit initial rating with review
          const result1 = await ratingService.submitRating(testFarmerId, testArticleId, rating, initialReview);
          
          // Verify review is stored with timestamp and farmer identification
          expect(result1.review).toBe(initialReview.trim());
          expect(result1.farmerId).toBe(testFarmerId);
          expect(result1.createdAt).toBeDefined();
          
          // Verify review appears in article ratings
          const ratings1 = await ratingService.getRatingsByArticle(testArticleId);
          expect(ratings1.ratings).toHaveLength(1);
          expect(ratings1.ratings[0].review).toBe(initialReview.trim());
          expect(ratings1.reviewCount).toBe(1);
          
          // Update review (should not create duplicate)
          const result2 = await ratingService.submitRating(testFarmerId, testArticleId, rating, updatedReview);
          expect(result2.review).toBe(updatedReview.trim());
          
          // Verify still only one review exists but content is updated
          const ratings2 = await ratingService.getRatingsByArticle(testArticleId);
          expect(ratings2.ratings).toHaveLength(1);
          expect(ratings2.ratings[0].review).toBe(updatedReview.trim());
          expect(ratings2.reviewCount).toBe(1);
          
          // Verify user can retrieve their updated review
          const userRating = await ratingService.getUserRating(testFarmerId, testArticleId);
          expect(userRating.review).toBe(updatedReview.trim());
        }
      ),
      { numRuns: 30 }
    );
  });
});