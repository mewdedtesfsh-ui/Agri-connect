const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Check if running in production (Render) or local
  const isProduction = process.env.DATABASE_URL;
  
  console.log('=== Database Setup ===');
  console.log('Environment:', isProduction ? 'Production (Render)' : 'Local Development');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  if (isProduction) {
    // Production: Use DATABASE_URL from Render
    console.log('Running in production mode...');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      await client.connect();
      console.log('✓ Connected to Render PostgreSQL');

      // Read and execute schema
      const schemaPath = path.join(__dirname, 'config', 'db-schema.sql');
      console.log('Reading schema from:', schemaPath);
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✓ Database schema created');

      await client.end();
      console.log('✓ Database setup complete!');
    } catch (err) {
      console.error('Error setting up database:', err.message);
      console.error('Full error:', err);
      process.exit(1);
    }
  } else {
    // Local development: Create database and tables
    console.log('Running in local development mode...');
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'admin',
      database: 'postgres'
    });

    try {
      await client.connect();
      console.log('Connected to PostgreSQL');

      // Create database
      try {
        await client.query('CREATE DATABASE agriconnect');
        console.log('✓ Database "agriconnect" created');
      } catch (err) {
        if (err.code === '42P04') {
          console.log('✓ Database "agriconnect" already exists');
        } else {
          throw err;
        }
      }

      await client.end();

      // Connect to agriconnect database to create tables
      const dbClient = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'admin',
        database: 'agriconnect'
      });

      await dbClient.connect();
      console.log('Connected to agriconnect database');

      // Read and execute schema
      const schema = fs.readFileSync(path.join(__dirname, 'config', 'db-schema.sql'), 'utf8');
      await dbClient.query(schema);
      console.log('✓ Database schema created');

      await dbClient.end();
      console.log('\n✓ Database setup complete!');
      console.log('\nNext steps:');
      console.log('1. Run: npm run seed');
      console.log('2. Run: npm start');
    } catch (err) {
      console.error('Error:', err.message);
      console.log('\nIf you see a password error, edit backend/setup-db.js and change the password.');
      process.exit(1);
    }
  }
}

setupDatabase();
