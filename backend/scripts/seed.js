const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL for production (Render) or individual vars for local
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

async function seed() {
  try {
    console.log('Starting database seed...');
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? 'Yes (Production)' : 'No (Local)');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin@123', 10);
    await pool.query(
      `INSERT INTO users (name, email, phone, password, role, location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING`,
      ['Admin User', 'admin@gmail.com', '+251911000000', adminPassword, 'admin', 'Addis Ababa']
    );
    console.log('Admin user created');

    // Create farmer users
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    const farmers = [
      ['Abebe Kebede', 'abebe@example.com', '+251911111111', 'Addis Ababa'],
      ['Tigist Alemu', 'tigist@example.com', '+251922222222', 'Bahir Dar'],
      ['Dawit Tesfaye', 'dawit@example.com', '+251933333333', 'Hawassa']
    ];

    for (const farmer of farmers) {
      await pool.query(
        `INSERT INTO users (name, email, phone, password, role, location) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (email) DO NOTHING`,
        [farmer[0], farmer[1], farmer[2], farmerPassword, 'farmer', farmer[3]]
      );
    }
    console.log('Farmer users created');

    // Create crops
    const crops = [
      ['Teff', 'Grain'],
      ['Wheat', 'Grain'],
      ['Maize', 'Grain'],
      ['Barley', 'Grain'],
      ['Sorghum', 'Grain'],
      ['Coffee', 'Cash Crop']
    ];

    for (const crop of crops) {
      await pool.query(
        'INSERT INTO crops (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        crop
      );
    }
    console.log('Crops created');

    // Create markets
    const markets = [
      ['Merkato', 'Addis Ababa'],
      ['Piazza', 'Addis Ababa'],
      ['Bahir Dar Market', 'Amhara'],
      ['Hawassa Market', 'SNNPR'],
      ['Mekelle Market', 'Tigray']
    ];

    for (const market of markets) {
      await pool.query(
        'INSERT INTO markets (name, region) VALUES ($1, $2) ON CONFLICT (name, region) DO NOTHING',
        market
      );
    }
    console.log('Markets created');

    // Get crop and market IDs
    const cropsResult = await pool.query('SELECT id, name FROM crops');
    const marketsResult = await pool.query('SELECT id, name FROM markets');

    // Create prices
    for (const crop of cropsResult.rows) {
      for (const market of marketsResult.rows) {
        const price = (Math.random() * 50 + 20).toFixed(2);
        await pool.query(
          'INSERT INTO prices (crop_id, market_id, price) VALUES ($1, $2, $3)',
          [crop.id, market.id, price]
        );
      }
    }
    console.log('Prices created');

    // Create extension officer user
    const extensionPassword = await bcrypt.hash('extension123', 10);
    await pool.query(
      `INSERT INTO users (name, email, phone, password, role, location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING`,
      ['Dr. Alemayehu Tadesse', 'extension@agriconnect.com', '+251944444444', extensionPassword, 'extension_officer', 'Addis Ababa']
    );
    console.log('Extension officer user created');

    // Create sample advice articles
    const extensionOfficer = await pool.query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['extension_officer']
    );

    if (extensionOfficer.rows.length > 0) {
      const officerId = extensionOfficer.rows[0].id;
      
      const articles = [
        ['Best Practices for Teff Cultivation', 'Teff is a staple crop in Ethiopia. Here are the best practices for growing teff: 1) Prepare the soil properly, 2) Use quality seeds, 3) Plant at the right time, 4) Manage weeds effectively, 5) Harvest at the right moisture level.', 'Crop Management'],
        ['Pest Control for Coffee Plants', 'Coffee berry disease is a major threat. Use integrated pest management: 1) Regular inspection, 2) Remove infected berries, 3) Apply fungicides when necessary, 4) Maintain proper spacing between plants.', 'Pest Control'],
        ['Water Management During Dry Season', 'Efficient water use is crucial during dry seasons. Tips: 1) Use drip irrigation, 2) Mulch around plants, 3) Plant drought-resistant varieties, 4) Harvest rainwater when possible.', 'Water Management']
      ];

      for (const article of articles) {
        await pool.query(
          'INSERT INTO advice_articles (extension_officer_id, title, content, category) VALUES ($1, $2, $3, $4)',
          [officerId, ...article]
        );
      }
      console.log('Sample advice articles created');
    }

    console.log('Database seed completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();
