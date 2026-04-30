import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const employees = await query('SELECT * FROM employees ORDER BY created_at DESC');
    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, full_name, position, department, basic_salary, bank_account } = body;

    const result: any = await query(
      'INSERT INTO employees (employee_id, full_name, position, department, basic_salary, bank_account) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, full_name, position, department, basic_salary || 0, bank_account || '']
    );

    return successResponse({ id: result.insertId }, 'Employee added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) return errorResponse('ID is required');

    const updates: string[] = [];
    const values: any[] = [];
    const fields = ['employee_id', 'full_name', 'position', 'department', 'basic_salary', 'bank_account', 'status'];

    fields.forEach(f => {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    });

    if (updates.length === 0) return errorResponse('No fields to update');

    values.push(id);
    await query(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values);
    
    return successResponse(null, 'Employee updated successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID is required');

    await query('DELETE FROM employees WHERE id = ?', [id]);
    return successResponse(null, 'Employee deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
