-- Migration: Add Advice Rating System
-- Description: Creates tables and indexes for the advice rating and review system
-- Date: 2024-01-01

-- Create advice_ratings table
CREATE TABLE IF NOT EXISTS advice_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES advice_articles(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, farmer_id)
);

-- Create advice_reviews table
CREATE TABLE IF NOT EXISTS advice_reviews (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES advice_articles(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL CHECK (LENGTH(TRIM(review_text)) > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, farmer_id),
  CONSTRAINT review_length CHECK (LENGTH(review_text) <= 1000)
);

-- Extend advice_articles table with computed rating columns
ALTER TABLE advice_articles 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Performance indexes for advice_ratings
CREATE INDEX IF NOT EXISTS idx_ratings_article ON advice_ratings(article_id);
CREATE INDEX IF NOT EXISTS idx_ratings_farmer ON advice_ratings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created ON advice_ratings(created_at);

-- Performance indexes for advice_reviews
CREATE INDEX IF NOT EXISTS idx_reviews_article ON advice_reviews(article_id);
CREATE INDEX IF NOT EXISTS idx_reviews_farmer ON advice_reviews(farmer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON advice_reviews(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ratings_article_farmer ON advice_ratings(article_id, farmer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_article_farmer ON advice_reviews(article_id, farmer_id);

-- Index for advice_articles rating columns
CREATE INDEX IF NOT EXISTS idx_articles_rating ON advice_articles(average_rating);
CREATE INDEX IF NOT EXISTS idx_articles_review_count ON advice_articles(review_count);

-- Function to update article rating statistics
CREATE OR REPLACE FUNCTION update_article_rating_stats(article_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE advice_articles 
  SET 
    average_rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2) 
       FROM advice_ratings 
       WHERE article_id = article_id_param), 
      0
    ),
    review_count = COALESCE(
      (SELECT COUNT(*) 
       FROM advice_reviews 
       WHERE article_id = article_id_param), 
      0
    )
  WHERE id = article_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically update rating statistics
CREATE OR REPLACE FUNCTION trigger_update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_article_rating_stats(NEW.article_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_article_rating_stats(OLD.article_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic rating statistics updates
DROP TRIGGER IF EXISTS trigger_ratings_stats ON advice_ratings;
CREATE TRIGGER trigger_ratings_stats
  AFTER INSERT OR UPDATE OR DELETE ON advice_ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_rating_stats();

DROP TRIGGER IF EXISTS trigger_reviews_stats ON advice_reviews;
CREATE TRIGGER trigger_reviews_stats
  AFTER INSERT OR UPDATE OR DELETE ON advice_reviews
  FOR EACH ROW EXECUTE FUNCTION trigger_update_rating_stats();

-- Initialize rating statistics for existing articles
UPDATE advice_articles 
SET 
  average_rating = 0,
  review_count = 0
WHERE average_rating IS NULL OR review_count IS NULL;

-- Add comments for documentation
COMMENT ON TABLE advice_ratings IS 'Stores star ratings (1-5) for advice articles by farmers';
COMMENT ON TABLE advice_reviews IS 'Stores text reviews for advice articles by farmers';
COMMENT ON COLUMN advice_articles.average_rating IS 'Computed average rating for the article (0-5, 2 decimal places)';
COMMENT ON COLUMN advice_articles.review_count IS 'Computed count of reviews for the article';
COMMENT ON FUNCTION update_article_rating_stats(INTEGER) IS 'Updates average_rating and review_count for a specific article';