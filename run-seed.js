const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    console.log('📝 Loaded credentials from .env.local');
  }
}

loadEnv();

async function injectSeedData() {
  console.log('🚀 Starting Data Injection to Mining ERP Database...');
  
  // Use credentials from .env.local or fallback to defaults
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'erp';
    console.log(`\n🔗 Connecting to database: "${dbName}"...`);
    await connection.query(`USE ${dbName}`);

    console.log(`\n📄 Reading seed script: seed_production_data.sql...`);
    const sqlPath = path.join(__dirname, 'seed_production_data.sql');
    
    if (!fs.existsSync(sqlPath)) {
        throw new Error("File seed_production_data.sql not found!");
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('💉 Injecting Premium Sample Data (Fleet, Maintenance, Inventory, DSR)...');
    await connection.query(sql);
    
    console.log('\n✅ SUCCESS! Example data has been inserted to the database.');
    console.log('✨ Your ERP Dashboard should now look "GACOR" with real data.');

    // Quick Count to confirm
    const [fleetCount] = await connection.query('SELECT COUNT(*) as total FROM fleet_status');
    const [invCount] = await connection.query('SELECT COUNT(*) as total FROM general_inventory');
    
    console.log(`\n📊 Summary:`);
    console.log(`- Units in Fleet: ${fleetCount[0].total}`);
    console.log(`- Inventory Items: ${invCount[0].total}`);

  } catch (error) {
    console.error('\n❌ ERROR during injection:');
    console.error(error.message);
  } finally {
    await connection.end();
  }
}

injectSeedData();
