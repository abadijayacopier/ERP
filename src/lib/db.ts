import mysql from 'mysql2/promise';

// Global is used here to maintain a cached connection across hot reloads in development
const globalForDb = global as unknown as { pool: mysql.Pool };

export const pool =
  globalForDb.pool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp',
    waitForConnections: true,
    connectionLimit: 10, // Max 10 concurrent connections
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = pool;

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('Database Query Error:', error.message);
    // If it's a connection error, let's log more info
    if (error.code === 'ER_CON_COUNT_ERROR') {
      console.error('CRITICAL: Too many connections. Pool limit is 10.');
    }
    throw error;
  }
}

export default pool;
