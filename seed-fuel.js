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

async function seed() {
  console.log('⛽ Starting Fuel & Logistics Data Seeding...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp'
  });

  try {
    // 1. Clear existing fuel data to avoid duplicates
    console.log('🧹 Cleaning old fuel entries...');
    await connection.query('DELETE FROM inventory_transactions WHERE item_type = "Fuel"');
    await connection.query('DELETE FROM general_inventory WHERE category = "Fuel"');

    // 2. Insert Fuel Tanks
    console.log('🛢️  Inserting Fuel Tanks...');
    const [tankAResult] = await connection.query(
      'INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES (?, ?, ?, ?, ?, ?)',
      ['FUEL TANK A (SOLAR)', 'Fuel', 15000, 'LITER', 2000, 'MAIN SITE PORT']
    );
    const [tankBResult] = await connection.query(
      'INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES (?, ?, ?, ?, ?, ?)',
      ['FUEL TANK B (SOLAR)', 'Fuel', 8500, 'LITER', 2000, 'JETTY AREA']
    );
    const [tankCResult] = await connection.query(
      'INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES (?, ?, ?, ?, ?, ?)',
      ['FUEL TANK C (DEXLITE)', 'Fuel', 1200, 'LITER', 500, 'WORKSHOP']
    );

    const tankAId = tankAResult.insertId;
    const tankBId = tankBResult.insertId;

    // 3. Insert Initial Transactions
    console.log('📝 Recording initial transactions...');
    const transactions = [
      [tankAId, 'Fuel', 'Out', 2500, 'EXC-201', 'Budi Santoso'],
      [tankAId, 'Fuel', 'Out', 1200, 'DT-105', 'Agus Prayitno'],
      [tankBId, 'Fuel', 'In', 5000, 'PO-FUEL-001', 'Pertamina Supplier'],
      [tankBId, 'Fuel', 'Out', 1800, 'EXC-202', 'Indra Wijaya']
    ];

    for (const tx of transactions) {
      await connection.query(
        'INSERT INTO inventory_transactions (item_id, item_type, transaction_type, quantity, reference_id, user_name) VALUES (?, ?, ?, ?, ?, ?)',
        tx
      );
    }

    console.log('✅ Fuel & Logistics seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await connection.end();
  }
}

seed();
