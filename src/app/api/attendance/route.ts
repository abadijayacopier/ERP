import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const attendance = await query(`
      SELECT a.*, e.full_name as name, e.employee_id as emp_code, s.name as shift_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN shifts s ON a.shift_id = s.id
      ORDER BY a.clock_in DESC
    `);
    return successResponse(attendance);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, shift_id, clock_in, status } = body;

    const result: any = await query(
      'INSERT INTO attendance (employee_id, shift_id, clock_in, status) VALUES (?, ?, ?, ?)',
      [employee_id, shift_id, clock_in || new Date(), status || 'Present']
    );

    return successResponse({ id: result.insertId }, 'Attendance logged', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID is required');

    await query('DELETE FROM attendance WHERE id = ?', [id]);
    return successResponse(null, 'Attendance log deleted');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
