import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const reports = await query('SELECT * FROM dsr_reports ORDER BY created_at DESC');
    return successResponse(reports);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { report_date, shift, supervisor_name, production_bcm, weather_condition, notes } = body;

    const result: any = await query(
      'INSERT INTO dsr_reports (report_date, shift, supervisor_name, production_bcm, weather_condition, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [report_date, shift, supervisor_name, production_bcm, weather_condition, notes]
    );

    return successResponse({ id: result.insertId }, 'DSR created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
