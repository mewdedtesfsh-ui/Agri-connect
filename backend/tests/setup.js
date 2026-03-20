// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment variables if not already set
if (!process.env.DB_NAME) {
  process.env.DB_NAME = process.env.DB_NAME || 'agriconnect_test';
}

// Increase timeout for database operations
jest.setTimeout(30000);