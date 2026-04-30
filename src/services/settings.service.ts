import { pool } from "@/lib/db";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export const SettingsService = {
  async getSettings() {
    const [rows]: any = await pool.query("SELECT * FROM company_settings LIMIT 1");
    return rows[0] || {};
  },

  async updateSettings(data: any) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(k => data[k]);
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    const [result]: any = await pool.query(
      `UPDATE company_settings SET ${setClause} WHERE id = 1`,
      [...values]
    );

    if (result.affectedRows === 0) {
        // If no settings exist, insert initial
        const columns = fields.join(', ');
        const placeholders = fields.map(() => '?').join(', ');
        await pool.query(`INSERT INTO company_settings (${columns}) VALUES (${placeholders})`, values);
    }

    return { success: true };
  },

  async backupDatabase() {
    // This is a simplified backup logic for development environment
    // In production, we would use mysqldump
    const dbName = process.env.DB_NAME || 'erp';
    const user = process.env.DB_USER || 'root';
    const pass = process.env.DB_PASSWORD || '';
    const host = process.env.DB_HOST || 'localhost';
    
    const fileName = `backup-${dbName}-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    const filePath = path.join(process.cwd(), 'public', 'backups', fileName);

    // Ensure directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'public', 'backups'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public', 'backups'), { recursive: true });
    }

    return new Promise((resolve, reject) => {
      // Command for Windows (adjust if on Linux)
      const command = `mysqldump -h ${host} -u ${user} ${pass ? `-p${pass}` : ''} ${dbName} > "${filePath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup Error: ${error.message}`);
          return reject(error);
        }
        resolve({ fileName, downloadPath: `/backups/${fileName}` });
      });
    });
  }
};
