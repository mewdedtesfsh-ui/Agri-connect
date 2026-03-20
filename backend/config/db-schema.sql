-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin', 'extension_officer')),
  location VARCHAR(255),
  profile_photo VARCHAR(255),
  approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'banned')),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, region)
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather cache table
CREATE TABLE IF NOT EXISTS weather_cache (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  temperature DECIMAL(5, 2),
  rainfall DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  forecast_data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_prices_crop_id ON prices(crop_id);
CREATE INDEX IF NOT EXISTS idx_prices_market_id ON prices(market_id);
CREATE INDEX IF NOT EXISTS idx_prices_date_updated ON prices(date_updated);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_cache(location);

-- Advice articles table
CREATE TABLE IF NOT EXISTS advice_articles (
  id SERIAL PRIMARY KEY,
  extension_officer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  media_type VARCHAR(50) CHECK (media_type IN ('image', 'video', 'audio')),
  media_url VARCHAR(500),
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmer questions table
CREATE TABLE IF NOT EXISTS farmer_questions (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES farmer_questions(id) ON DELETE CASCADE,
  extension_officer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for extension officer features
CREATE INDEX IF NOT EXISTS idx_advice_officer ON advice_articles(extension_officer_id);
CREATE INDEX IF NOT EXISTS idx_articles_rating ON advice_articles(average_rating);
CREATE INDEX IF NOT EXISTS idx_articles_review_count ON advice_articles(review_count);
CREATE INDEX IF NOT EXISTS idx_questions_farmer ON farmer_questions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON farmer_questions(status);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_officer ON answers(extension_officer_id);

-- Advice ratings table
CREATE TABLE IF NOT EXISTS advice_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES advice_articles(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, farmer_id)
);

-- Advice reviews table
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

-- Weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN ('Heavy Rainfall', 'Flood Risk', 'Drought', 'Extreme Heat', 'Strong Winds')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Index for weather alerts
CREATE INDEX IF NOT EXISTS idx_alerts_location ON weather_alerts(location);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON weather_alerts(created_at);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum post likes table
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Indexes for forum
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON forum_post_likes(user_id);

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  message_in TEXT NOT NULL,
  message_out TEXT,
  command_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Index for SMS logs
CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_created ON sms_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_status ON sms_logs(status);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('advice', 'weather_alert', 'price_change', 'question_answered')),
  message TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

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
