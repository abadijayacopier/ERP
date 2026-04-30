const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function updateDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'erp',
  });

  try {
    console.log('Adding password column to users table...');
    // Check if password column exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM users LIKE "password"');
    
    if (columns.length === 0) {
      await connection.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER full_name');
      console.log('Column password added.');
    } else {
      console.log('Column password already exists.');
    }

    // Update existing users with a default password (e.g., 'password123')
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Setting default passwords for existing users...');
    await connection.execute('UPDATE users SET password = ? WHERE password IS NULL OR password = ""', [hashedPassword]);
    
    console.log('Database updated successfully.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await connection.end();
  }
}

updateDb();
