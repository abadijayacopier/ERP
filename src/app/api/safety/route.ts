import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    // Auto-create table if not exists
    await query(`
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

    const data = await query('SELECT * FROM incidents ORDER BY created_at DESC');
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, severity, location, description, user_name } = body;

    const result: any = await query(
      'INSERT INTO incidents (type, severity, location, description, user_name) VALUES (?, ?, ?, ?, ?)',
      [type, severity, location, description, user_name || 'system']
    );

    return successResponse({ id: result.insertId }, 'Incident reported successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID is required');

    await query('DELETE FROM incidents WHERE id = ?', [id]);
    return successResponse(null, 'Incident record deleted');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
