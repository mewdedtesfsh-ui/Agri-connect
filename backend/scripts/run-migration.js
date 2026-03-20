const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agriconnect',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log(`Migration ${migrationFile} completed successfully`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Migration ${migrationFile} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    // Run the rating system migration
    await runMigration('001_add_rating_system.sql');
    
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigration };