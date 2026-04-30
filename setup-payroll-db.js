const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupPayrollDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME,
  });

  console.log('Building HRMS & Payroll Infrastructure...');

  try {
    // 1. Employees Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        position VARCHAR(50),
        department VARCHAR(50),
        basic_salary DECIMAL(15, 2),
        overtime_rate_per_hour DECIMAL(15, 2),
        bank_account VARCHAR(50),
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Shifts Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      )
    `);

    // Seed Shifts
    const [existingShifts] = await connection.execute('SELECT COUNT(*) as count FROM shifts');
    if (existingShifts[0].count === 0) {
      await connection.execute("INSERT INTO shifts (name, start_time, end_time) VALUES ('Pagi', '07:00:00', '15:00:00'), ('Sore', '15:00:00', '23:00:00'), ('Malam', '23:00:00', '07:00:00')");
    }

    // 3. Attendance Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        shift_id INT NOT NULL,
        clock_in DATETIME,
        clock_out DATETIME,
        overtime_hours DECIMAL(5, 2) DEFAULT 0,
        status ENUM('Present', 'Absent', 'Late', 'Leave') DEFAULT 'Present',
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (shift_id) REFERENCES shifts(id)
      )
    `);

    // 4. Payrolls Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payrolls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        period_month INT NOT NULL,
        period_year INT NOT NULL,
        total_days_present INT,
        total_overtime_hours DECIMAL(10, 2),
        basic_salary_snapshot DECIMAL(15, 2),
        overtime_pay DECIMAL(15, 2),
        total_salary DECIMAL(15, 2),
        status ENUM('Draft', 'Paid') DEFAULT 'Draft',
        paid_at DATETIME,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    console.log('HRMS & Payroll Infrastructure deployed successfully!');
  } catch (error) {
    console.error('Error setting up payroll DB:', error);
  } finally {
    await connection.end();
  }
}

setupPayrollDb();
