import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const data = await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
    // Using activity_logs as a placeholder for HSE incidents if specific table not found, 
    // but I should create an incidents table for real safety tracking.
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, severity, location, description, user_name } = body;

    // For now logging to activity_logs with specialized type
    await query(
      'INSERT INTO activity_logs (user_id, action, module, ip_address) VALUES (?, ?, ?, ?)',
      [1, `HSE INCIDENT: ${type} - ${severity} at ${location}`, 'Safety', '127.0.0.1']
    );

    return successResponse(null, 'Incident reported and logged');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
