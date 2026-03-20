const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupTestDatabase() {
  // First connect to postgres database to create test database
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

    // Drop test database if exists
    try {
      await client.query('DROP DATABASE IF EXISTS agriconnect_test');
      console.log('✓ Dropped existing test database');
    } catch (err) {
      console.log('No existing test database to drop');
    }

    // Create test database
    try {
      await client.query('CREATE DATABASE agriconnect_test');
      console.log('✓ Test database "agriconnect_test" created');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('✓ Test database "agriconnect_test" already exists');
      } else {
        throw err;
      }
    }

    await client.end();

    // Connect to test database to create tables
    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'admin',
      database: 'agriconnect_test'
    });

    await dbClient.connect();
    console.log('Connected to test database');

    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'config', 'db-schema.sql'), 'utf8');
    await dbClient.query(schema);
    console.log('✓ Test database schema created');

    // Apply rating system migration
    const migration = fs.readFileSync(path.join(__dirname, 'migrations', '001_add_rating_system.sql'), 'utf8');
    await dbClient.query(migration);
    console.log('✓ Rating system migration applied');

    await dbClient.end();
    console.log('\n✓ Test database setup complete!');
  } catch (err) {
    console.error('Error:', err.message);
    console.log('\nIf you see a password error, check your PostgreSQL credentials.');
    process.exit(1);
  }
}

setupTestDatabase();