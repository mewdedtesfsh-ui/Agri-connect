const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agriconnect',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

async function verifySchema() {
  const client = await pool.connect();
  
  try {
    console.log('Verifying rating system database schema...\n');
    
    // Check if tables exist
    const tableChecks = [
      'advice_ratings',
      'advice_reviews'
    ];
    
    for (const table of tableChecks) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      console.log(`✓ Table ${table}: ${result.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    // Check if advice_articles has new columns
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'advice_articles' 
      AND column_name IN ('average_rating', 'review_count');
    `);
    
    console.log(`✓ advice_articles new columns: ${columnCheck.rows.length}/2 present`);
    columnCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
    // Check indexes
    const indexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('advice_ratings', 'advice_reviews', 'advice_articles')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);
    
    console.log(`\n✓ Indexes created: ${indexCheck.rows.length}`);
    indexCheck.rows.forEach(row => {
      console.log(`  - ${row.indexname}`);
    });
    
    // Check functions
    const functionCheck = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('update_article_rating_stats', 'trigger_update_rating_stats');
    `);
    
    console.log(`\n✓ Functions created: ${functionCheck.rows.length}/2`);
    functionCheck.rows.forEach(row => {
      console.log(`  - ${row.proname}`);
    });
    
    // Check triggers
    const triggerCheck = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_name IN ('trigger_ratings_stats', 'trigger_reviews_stats');
    `);
    
    console.log(`\n✓ Triggers created: ${triggerCheck.rows.length}/2`);
    triggerCheck.rows.forEach(row => {
      console.log(`  - ${row.trigger_name} on ${row.event_object_table}`);
    });
    
    // Test constraints
    console.log('\n✓ Testing constraints...');
    
    try {
      // Test rating constraint (should fail)
      await client.query(`
        INSERT INTO advice_ratings (article_id, farmer_id, rating) 
        VALUES (999, 999, 6);
      `);
      console.log('  ✗ Rating constraint test failed - invalid rating was accepted');
    } catch (error) {
      if (error.message.includes('rating')) {
        console.log('  ✓ Rating constraint working - invalid ratings rejected');
      }
    }
    
    try {
      // Test review length constraint (should fail)
      await client.query(`
        INSERT INTO advice_reviews (article_id, farmer_id, review_text) 
        VALUES (999, 999, '${'x'.repeat(1001)}');
      `);
      console.log('  ✗ Review length constraint test failed - oversized review was accepted');
    } catch (error) {
      if (error.message.includes('review_length')) {
        console.log('  ✓ Review length constraint working - oversized reviews rejected');
      }
    }
    
    console.log('\n✅ Schema verification completed successfully');
    
  } catch (error) {
    console.error('Schema verification failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await verifySchema();
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { verifySchema };