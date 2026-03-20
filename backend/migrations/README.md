# Database Migrations

This directory contains database migration scripts for the AgriConnect platform.

## Available Migrations

### 001_add_rating_system.sql
Adds the advice rating and review system to the database.

**Creates:**
- `advice_ratings` table - stores star ratings (1-5) for advice articles
- `advice_reviews` table - stores text reviews for advice articles  
- Extends `advice_articles` table with `average_rating` and `review_count` columns
- Performance indexes for efficient queries
- Database functions for automatic rating calculations
- Triggers to maintain rating statistics

**Features:**
- Automatic average rating calculation when ratings are added/updated/deleted
- Automatic review count maintenance
- Data integrity constraints (rating range 1-5, review length limits)
- Unique constraints to prevent duplicate ratings/reviews per farmer
- Cascade deletion when articles are removed

## Running Migrations

### Apply Migration
```bash
node backend/scripts/run-migration.js
```

### Verify Schema
```bash
node backend/scripts/verify-rating-schema.js
```

### Test Functionality
```bash
node backend/scripts/test-rating-functionality.js
```

### Rollback Migration
```bash
# Manual rollback using psql
psql -U postgres -d agriconnect -f backend/migrations/001_rollback_rating_system.sql
```

## Database Schema Changes

### New Tables

#### advice_ratings
```sql
CREATE TABLE advice_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES advice_articles(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, farmer_id)
);
```

#### advice_reviews
```sql
CREATE TABLE advice_reviews (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES advice_articles(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL CHECK (LENGTH(TRIM(review_text)) > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, farmer_id),
  CONSTRAINT review_length CHECK (LENGTH(review_text) <= 1000)
);
```

### Extended Tables

#### advice_articles (new columns)
- `average_rating DECIMAL(3,2) DEFAULT 0` - Computed average rating (0-5, 2 decimal places)
- `review_count INTEGER DEFAULT 0` - Computed count of reviews

### Performance Indexes

- `idx_ratings_article` - Fast lookups by article
- `idx_ratings_farmer` - Fast lookups by farmer
- `idx_ratings_created` - Chronological ordering
- `idx_reviews_article` - Fast review lookups by article
- `idx_reviews_farmer` - Fast review lookups by farmer
- `idx_reviews_created` - Chronological ordering
- `idx_ratings_article_farmer` - Composite index for user-article queries
- `idx_reviews_article_farmer` - Composite index for user-article queries
- `idx_articles_rating` - Fast sorting by rating
- `idx_articles_review_count` - Fast sorting by review count

### Database Functions

#### update_article_rating_stats(article_id)
Recalculates and updates the `average_rating` and `review_count` for a specific article.

#### trigger_update_rating_stats()
Trigger function that automatically calls `update_article_rating_stats()` when ratings or reviews are modified.

### Triggers

- `trigger_ratings_stats` - Fires on INSERT/UPDATE/DELETE of ratings
- `trigger_reviews_stats` - Fires on INSERT/UPDATE/DELETE of reviews

## Requirements Satisfied

This migration satisfies the following requirements from the spec:

- **8.1** - Database indexes for efficient queries
- **8.2** - Batch rating calculations to minimize database load  
- **8.3** - Single query retrieval of rating summaries for advice lists

## Performance Considerations

- All foreign key relationships use proper indexes
- Composite indexes optimize common query patterns
- Triggers maintain denormalized rating statistics for fast reads
- Constraints prevent invalid data at the database level
- Cascade deletion ensures referential integrity

## Testing

The migration includes comprehensive testing:

1. **Schema Verification** - Confirms all tables, indexes, functions, and triggers are created
2. **Constraint Testing** - Validates data integrity rules
3. **Functionality Testing** - Tests rating calculations, updates, and deletions
4. **Performance Testing** - Verifies trigger performance and accuracy

Run all tests after applying the migration to ensure everything works correctly.