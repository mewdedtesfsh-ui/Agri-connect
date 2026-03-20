-- Rollback Migration: Remove Advice Rating System
-- Description: Removes tables, indexes, functions and triggers for the advice rating system
-- Date: 2024-01-01

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_ratings_stats ON advice_ratings;
DROP TRIGGER IF EXISTS trigger_reviews_stats ON advice_reviews;

-- Drop functions
DROP FUNCTION IF EXISTS trigger_update_rating_stats();
DROP FUNCTION IF EXISTS update_article_rating_stats(INTEGER);

-- Drop indexes
DROP INDEX IF EXISTS idx_ratings_article;
DROP INDEX IF EXISTS idx_ratings_farmer;
DROP INDEX IF EXISTS idx_ratings_created;
DROP INDEX IF EXISTS idx_reviews_article;
DROP INDEX IF EXISTS idx_reviews_farmer;
DROP INDEX IF EXISTS idx_reviews_created;
DROP INDEX IF EXISTS idx_ratings_article_farmer;
DROP INDEX IF EXISTS idx_reviews_article_farmer;
DROP INDEX IF EXISTS idx_articles_rating;
DROP INDEX IF EXISTS idx_articles_review_count;

-- Remove columns from advice_articles
ALTER TABLE advice_articles 
DROP COLUMN IF EXISTS average_rating,
DROP COLUMN IF EXISTS review_count;

-- Drop tables
DROP TABLE IF EXISTS advice_reviews;
DROP TABLE IF EXISTS advice_ratings;

-- Log rollback completion
SELECT 'Rating system rollback completed' AS status;