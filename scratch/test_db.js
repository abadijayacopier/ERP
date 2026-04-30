const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'erp'
    });
    console.log('Connected!');
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables:', rows);
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
