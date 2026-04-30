import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const data = await query('SELECT * FROM maintenance_jobs ORDER BY created_at DESC');
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Gunakan 'type' agar sinkron dengan Frontend dan Database
    const { unit_id, type, priority, status, mechanic_name, scheduled_date } = body;

    // Pastikan variabel tidak undefined
    const result: any = await query(
      'INSERT INTO maintenance_jobs (unit_id, type, priority, status, mechanic_name, scheduled_date) VALUES (?, ?, ?, ?, ?, ?)',
      [unit_id || null, type || 'Preventive', priority || 'Medium', status || 'Scheduled', mechanic_name || null, scheduled_date || null]
    );

    return successResponse({ id: result.insertId }, 'Job scheduled successfully', 201);
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
    const fields = ['unit_id', 'type', 'priority', 'status', 'mechanic_name', 'scheduled_date', 'description', 'started_at', 'completed_at'];

    fields.forEach(f => {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        let val = body[f];
        // Clean up ISO date for MySQL (YYYY-MM-DD HH:MM:SS)
        if ((f === 'started_at' || f === 'completed_at') && val) {
          try {
            val = new Date(val).toISOString().slice(0, 19).replace('T', ' ');
          } catch(e) {}
        }
        values.push(val);
      }
    });

    if (updates.length === 0) return errorResponse('No fields to update');

    values.push(id);
    try {
      await query(`UPDATE maintenance_jobs SET ${updates.join(', ')} WHERE id = ?`, values);
    } catch (dbError: any) {
      // Auto-healing for both columns
      if (dbError.message.includes('Unknown column \'started_at\'') || dbError.message.includes('Unknown column \'completed_at\'')) {
        try { await query('ALTER TABLE maintenance_jobs ADD COLUMN started_at DATETIME NULL AFTER status'); } catch(e){}
        try { await query('ALTER TABLE maintenance_jobs ADD COLUMN completed_at DATETIME NULL AFTER started_at'); } catch(e){}
        // Try the update again
        await query(`UPDATE maintenance_jobs SET ${updates.join(', ')} WHERE id = ?`, values);
      } else {
        throw dbError;
      }
    }
    
    return successResponse(null, 'Updated successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    await query('DELETE FROM maintenance_jobs WHERE id = ?', [id]);
    
    return successResponse(null, 'Job record deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
