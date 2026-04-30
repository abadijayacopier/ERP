const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'erp',
  });

  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Seeding initial users...');

    // Clear existing users to avoid unique constraint issues during seed
    await connection.execute('DELETE FROM users');

    // Reset auto increment
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');

    const users = [
      ['adi_admin', 'Adi Rahman Samari', 'ADMIN', 'MANAGEMENT', passwordHash],
      ['budi_ops', 'Budi Santoso', 'EXECUTIVE', 'SITE OPERATIONS', passwordHash],
      ['agus_fix', 'Agus Mekanik', 'TECHNICIAN', 'MAINTENANCE', passwordHash],
      ['siti_hse', 'Siti Safety', 'HSE', 'SAFETY', passwordHash],
      ['indra_ops', 'Indra Operator', 'OPERATOR', 'PRODUCTION', passwordHash]
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (username, full_name, role, department, password) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }

    console.log('Successfully seeded users with default password: admin123');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await connection.end();
  }
}

seedUsers();
