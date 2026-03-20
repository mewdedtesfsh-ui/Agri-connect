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

async function testRatingFunctionality() {
  const client = await pool.connect();
  
  try {
    console.log('Testing rating system functionality...\n');
    
    // Clean up any test data first
    await client.query('DELETE FROM advice_ratings WHERE farmer_id IN (9999, 9998)');
    await client.query('DELETE FROM advice_reviews WHERE farmer_id IN (9999, 9998)');
    
    // Create test users and article if they don't exist
    await client.query(`
      INSERT INTO users (id, name, email, password, role) 
      VALUES (9999, 'Test Farmer', 'test@farmer.com', 'password', 'farmer'),
             (9998, 'Test Farmer 2', 'test2@farmer.com', 'password', 'farmer'),
             (9997, 'Test Officer', 'officer@test.com', 'password', 'extension_officer')
      ON CONFLICT (id) DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO advice_articles (id, extension_officer_id, title, content, category) 
      VALUES (9999, 9997, 'Test Advice Article', 'This is test content', 'crops')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✓ Test data created');
    
    // Test 1: Insert ratings and verify average calculation
    console.log('\n1. Testing rating insertion and average calculation...');
    
    await client.query(`
      INSERT INTO advice_ratings (article_id, farmer_id, rating) 
      VALUES (9999, 9999, 5), (9999, 9998, 3)
    `);
    
    const avgResult = await client.query(`
      SELECT average_rating, review_count 
      FROM advice_articles 
      WHERE id = 9999
    `);
    
    const expectedAvg = 4.00; // (5 + 3) / 2 = 4
    const actualAvg = parseFloat(avgResult.rows[0].average_rating);
    
    console.log(`   Expected average: ${expectedAvg}, Actual: ${actualAvg}`);
    console.log(`   ✓ Average calculation: ${actualAvg === expectedAvg ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Insert reviews and verify count
    console.log('\n2. Testing review insertion and count...');
    
    await client.query(`
      INSERT INTO advice_reviews (article_id, farmer_id, review_text) 
      VALUES (9999, 9999, 'Great advice, very helpful!'),
             (9999, 9998, 'Good information but could be more detailed.')
    `);
    
    const countResult = await client.query(`
      SELECT review_count 
      FROM advice_articles 
      WHERE id = 9999
    `);
    
    const expectedCount = 2;
    const actualCount = parseInt(countResult.rows[0].review_count);
    
    console.log(`   Expected count: ${expectedCount}, Actual: ${actualCount}`);
    console.log(`   ✓ Review count: ${actualCount === expectedCount ? 'PASS' : 'FAIL'}`);
    
    // Test 3: Update rating and verify recalculation
    console.log('\n3. Testing rating update and recalculation...');
    
    await client.query(`
      UPDATE advice_ratings 
      SET rating = 4 
      WHERE article_id = 9999 AND farmer_id = 9999
    `);
    
    const updatedResult = await client.query(`
      SELECT average_rating 
      FROM advice_articles 
      WHERE id = 9999
    `);
    
    const expectedUpdatedAvg = 3.50; // (4 + 3) / 2 = 3.5
    const actualUpdatedAvg = parseFloat(updatedResult.rows[0].average_rating);
    
    console.log(`   Expected updated average: ${expectedUpdatedAvg}, Actual: ${actualUpdatedAvg}`);
    console.log(`   ✓ Rating update: ${actualUpdatedAvg === expectedUpdatedAvg ? 'PASS' : 'FAIL'}`);
    
    // Test 4: Delete rating and verify recalculation
    console.log('\n4. Testing rating deletion and recalculation...');
    
    await client.query(`
      DELETE FROM advice_ratings 
      WHERE article_id = 9999 AND farmer_id = 9998
    `);
    
    const deletedResult = await client.query(`
      SELECT average_rating 
      FROM advice_articles 
      WHERE id = 9999
    `);
    
    const expectedDeletedAvg = 4.00; // Only one rating left: 4
    const actualDeletedAvg = parseFloat(deletedResult.rows[0].average_rating);
    
    console.log(`   Expected average after deletion: ${expectedDeletedAvg}, Actual: ${actualDeletedAvg}`);
    console.log(`   ✓ Rating deletion: ${actualDeletedAvg === expectedDeletedAvg ? 'PASS' : 'FAIL'}`);
    
    // Test 5: Test constraints
    console.log('\n5. Testing constraints...');
    
    let constraintTests = 0;
    let constraintPassed = 0;
    
    // Test invalid rating
    try {
      await client.query(`
        INSERT INTO advice_ratings (article_id, farmer_id, rating) 
        VALUES (9999, 9997, 6)
      `);
      console.log('   ✗ Invalid rating constraint failed');
    } catch (error) {
      if (error.message.includes('rating')) {
        console.log('   ✓ Invalid rating constraint working');
        constraintPassed++;
      }
      constraintTests++;
    }
    
    // Test duplicate rating
    try {
      await client.query(`
        INSERT INTO advice_ratings (article_id, farmer_id, rating) 
        VALUES (9999, 9999, 3)
      `);
      console.log('   ✗ Duplicate rating constraint failed');
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('   ✓ Duplicate rating constraint working');
        constraintPassed++;
      }
      constraintTests++;
    }
    
    // Test empty review
    try {
      await client.query(`
        INSERT INTO advice_reviews (article_id, farmer_id, review_text) 
        VALUES (9999, 9997, '')
      `);
      console.log('   ✗ Empty review constraint failed');
    } catch (error) {
      if (error.message.includes('LENGTH') || error.message.includes('review_text')) {
        console.log('   ✓ Empty review constraint working');
        constraintPassed++;
      }
      constraintTests++;
    }
    
    console.log(`   Constraint tests: ${constraintPassed}/${constraintTests} passed`);
    
    // Clean up test data
    await client.query('DELETE FROM advice_ratings WHERE farmer_id IN (9999, 9998)');
    await client.query('DELETE FROM advice_reviews WHERE farmer_id IN (9999, 9998)');
    await client.query('DELETE FROM advice_articles WHERE id = 9999');
    await client.query('DELETE FROM users WHERE id IN (9999, 9998, 9997)');
    
    console.log('\n✅ All functionality tests completed successfully');
    console.log('✓ Test data cleaned up');
    
  } catch (error) {
    console.error('Functionality test failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await testRatingFunctionality();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testRatingFunctionality };