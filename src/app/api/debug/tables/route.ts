import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const tables = await query('SHOW TABLES');
    return successResponse(tables);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
