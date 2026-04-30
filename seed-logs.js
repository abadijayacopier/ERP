const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function seedLogs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME,
  });

  console.log('Seeding activity logs...');

  const logs = [
    ['adi_rahman', 'LOGIN', 'Auth', 'Successful login from IP 192.168.1.5', '192.168.1.5', 'Mozilla/5.0...'],
    ['adi_rahman', 'UPDATE', 'Settings', 'Updated company profile name to Abadi Jaya ERP', '192.168.1.5', 'Mozilla/5.0...'],
    ['budi_ops', 'CREATE', 'Fleet', 'Registered new Hauler unit H-102', '10.0.0.42', 'Chrome/124.0...'],
    ['agus_fix', 'APPROVE', 'Maintenance', 'Completed service for Excavator EX-001', '10.0.0.15', 'Edge/123.0...'],
    ['system', 'BACKUP', 'Database', 'Nightly logistics database backup completed', '127.0.0.1', 'Node.js/20.0']
  ];

  try {
    // Clear existing logs (optional, but good for demo)
    await connection.execute('DELETE FROM activity_logs');
    
    for (const log of logs) {
      await connection.execute(
        'INSERT INTO activity_logs (user_name, action, module, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        log
      );
    }
    console.log('Successfully seeded 5 activity logs!');
  } catch (error) {
    console.error('Error seeding logs:', error);
  } finally {
    await connection.end();
  }
}

seedLogs();
