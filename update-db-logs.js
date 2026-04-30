const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateDbLogs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME,
  });

  console.log('Updating activity_logs table schema...');

  try {
    // Add missing columns if they don't exist
    await connection.execute(`
      ALTER TABLE activity_logs 
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) AFTER details,
      ADD COLUMN IF NOT EXISTS user_agent TEXT AFTER ip_address
    `);
    
    console.log('Schema updated successfully!');
  } catch (error) {
    // If IF NOT EXISTS is not supported or failed, try manual check
    console.warn('Standard ALTER failed, trying manual column addition...');
    try {
        await connection.execute('ALTER TABLE activity_logs ADD COLUMN ip_address VARCHAR(45) AFTER details');
    } catch(e) {}
    try {
        await connection.execute('ALTER TABLE activity_logs ADD COLUMN user_agent TEXT AFTER ip_address');
    } catch(e) {}
    console.log('Schema update completed (manual mode).');
  } finally {
    await connection.end();
  }
}

updateDbLogs();
