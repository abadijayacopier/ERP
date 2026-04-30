const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupIncidentsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME,
  });

  console.log('Building HSE Incidents Infrastructure...');

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low',
        location VARCHAR(100),
        description TEXT,
        user_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed with sample data if empty
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM incidents');
    if (existing[0].count === 0) {
      await connection.execute(`
        INSERT INTO incidents (type, severity, location, description, user_name) VALUES 
        ('Near Miss', 'Low', 'PIT B South', 'Light vehicle nearly hit by Hauler 777 due to blind spot.', 'adi_rahman'),
        ('Property Damage', 'Medium', 'Workshop Main', 'Overhead crane cable snapped during engine lifting. No injuries.', 'agus_mekanik'),
        ('First Aid', 'Low', 'Admin Office', 'Personnel slipped on wet floor near cafeteria.', 'siti_safety'),
        ('Hazard Observation', 'High', 'Explosive Magazine', 'Fire extinguisher expired. Immediate replacement required.', 'budi_ops'),
        ('Near Miss', 'Medium', 'Hauling Road KM-3', 'Dump truck brake failure on downhill slope. Emergency stop used.', 'system')
      `);
      console.log('Seeded 5 sample incidents.');
    }

    console.log('HSE Incidents table deployed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

setupIncidentsTable();
