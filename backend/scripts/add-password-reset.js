const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addPasswordResetSupport() {
  try {
    console.log('🔄 Adding password reset support...');

    // Create migration_log table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migration_log (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read and execute the migration
    const migrationPath = path.join(__dirname, '../migrations/003_add_password_reset.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Password reset support added successfully!');
    console.log('📧 Don\'t forget to configure email settings in your .env file:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_SECURE=false');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('   EMAIL_FROM=AgriConnect <your-email@gmail.com>');
    console.log('   FRONTEND_URL=http://localhost:3002');
    
  } catch (error) {
    console.error('❌ Error adding password reset support:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addPasswordResetSupport();