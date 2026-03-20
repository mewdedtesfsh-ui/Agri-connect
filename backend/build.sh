#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Run database setup if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Setting up database..."
  node setup-db.js
  echo "Running seed data..."
  node scripts/seed.js
fi
