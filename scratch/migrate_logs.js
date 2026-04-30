const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'erp_db'
  });

  try {
    console.log('Running migration: Adding IP and UA to activity_logs...');
    
    // Check if columns exist first or just try to add them
    try {
      await connection.query('ALTER TABLE activity_logs ADD COLUMN ip_address VARCHAR(45) AFTER details');
      console.log('Added ip_address column.');
    } catch (e) {
      console.log('ip_address column might already exist.');
    }

    try {
      await connection.query('ALTER TABLE activity_logs ADD COLUMN user_agent TEXT AFTER ip_address');
      console.log('Added user_agent column.');
    } catch (e) {
      console.log('user_agent column might already exist.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
