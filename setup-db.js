const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
    console.log('📝 Loaded environment from .env.local');
  }
}

loadEnv();

async function setup() {
  console.log('🚀 Starting Database Fresh Setup...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'erp';
    
    console.log(`\n1. Preparing database "${dbName}"...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    
    // List of tables to drop for a clean start
    const tablesToDrop = [
        'dsr_reports', 'fleet_status', 'spareparts', 'general_inventory', 
        'inventory_transactions', 'maintenance_jobs', 'parts_usage', 
        'invoices', 'invoice_items', 'activity_logs', 'company_settings', 'printers',
        'vendors', 'purchase_orders'
    ];
    
    console.log('🧹 Cleaning old tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tablesToDrop) {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Workspace is clean.');

    console.log(`\n2. Executing schema from database_schema.sql...`);
    const sqlPath = path.join(__dirname, 'database_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Run the whole file as multiple statements
    await connection.query(sql);
    console.log('✅ SQL Schema executed successfully.');

    // FINAL CHECK
    console.log('\n🔍 Final Check: Listing tables in database...');
    const [rows] = await connection.query('SHOW TABLES');
    const tableNames = rows.map(r => Object.values(r)[0]);
    console.log('Tables found:', tableNames.join(', '));

    if (tableNames.includes('dsr_reports')) {
        console.log('✨ SUCCESS! dsr_reports is confirmed exists.');
    } else {
        console.error('❌ ERROR: dsr_reports is still missing from the list!');
    }

  } catch (error) {
    console.error('\n❌ ERROR during setup:');
    console.error(error.message);
    if (error.sql) console.error('SQL:', error.sql);
  } finally {
    await connection.end();
  }
}

setup();
