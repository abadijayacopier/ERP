import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon, handling potential empty lines or comments
    const statements = sqlContent
      .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/) // Advanced split to ignore semicolons in strings
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    for (const statement of statements) {
      try {
        await query(statement);
        successCount++;
      } catch (err: any) {
        // Log error but continue
        console.warn(`Statement failed: ${err.message}`);
      }
    }

    return successResponse({ 
      message: "Database Setup Successful!", 
      total_statements: statements.length,
      success_count: successCount
    });

  } catch (error: any) {
    console.error("Setup DB Error:", error);
    return errorResponse(error.message);
  }
}
