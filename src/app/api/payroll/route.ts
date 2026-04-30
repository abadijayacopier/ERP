import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const payrolls = await query(`
      SELECT p.*, e.full_name as name, e.employee_id as emp_code 
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.period_year DESC, p.period_month DESC
    `);
    return successResponse(payrolls);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, month, year, basic_salary, overtime_pay, status } = body;

    const result: any = await query(
      'INSERT INTO payrolls (employee_id, period_month, period_year, basic_salary_snapshot, overtime_pay, total_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employee_id, month, year, basic_salary, overtime_pay, (parseFloat(basic_salary) + parseFloat(overtime_pay)), status || 'Draft']
    );

    return successResponse({ id: result.insertId }, 'Payroll record created', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID is required');

    await query('DELETE FROM payrolls WHERE id = ?', [id]);
    return successResponse(null, 'Payroll record deleted');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
