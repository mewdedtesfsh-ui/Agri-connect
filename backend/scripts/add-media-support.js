const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addMediaSupport() {
  try {
    console.log('Adding media support to advice_articles table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../config/add-media-columns.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✓ Media columns added successfully');
    console.log('✓ Database migration completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding media support:', error);
    process.exit(1);
  }
}

addMediaSupport();
