import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const fleet = await query('SELECT * FROM fleet_status ORDER BY created_at DESC');
    return successResponse(fleet);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { unit_id, model, category, serial_number, engine_serial_number, status, location, fuel_level, hm, fuel } = body;

    const result: any = await query(
      'INSERT INTO fleet (unit_id, model, category, serial_number, engine_serial_number, status, location, fuel_level, hm, fuel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [unit_id, model, category || null, serial_number || null, engine_serial_number || null, status || 'Standby', location || 'Workshop', fuel_level || 100, hm || 0, fuel || 0]
    );

    return successResponse({ id: result.insertId }, 'Unit added successfully', 201);
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
    const fields = [
      'unit_id', 'model', 'category', 'status', 'location', 
      'fuel_level', 'hm', 'fuel', 'serial_number', 
      'engine_serial_number', 'photo_url', 'latitude', 'longitude'
    ];

    fields.forEach(f => {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    });

    if (updates.length === 0) return errorResponse('No fields to update');

    values.push(id);
    try {
      await query(`UPDATE fleet SET ${updates.join(', ')} WHERE id = ?`, values);
    } catch (dbError: any) {
      // Auto-healing for fleet table
      if (dbError.message.includes('Unknown column')) {
        try { await query('ALTER TABLE fleet ADD COLUMN serial_number VARCHAR(100) NULL AFTER model'); } catch(e){}
        try { await query('ALTER TABLE fleet ADD COLUMN engine_serial_number VARCHAR(100) NULL AFTER serial_number'); } catch(e){}
        try { await query('ALTER TABLE fleet ADD COLUMN category VARCHAR(50) NULL AFTER engine_serial_number'); } catch(e){}
        try { await query('ALTER TABLE fleet ADD COLUMN photo_url TEXT NULL AFTER category'); } catch(e){}
        try { await query('ALTER TABLE fleet ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER photo_url'); } catch(e){}
        try { await query('ALTER TABLE fleet ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude'); } catch(e){}
        // Retry update
        await query(`UPDATE fleet SET ${updates.join(', ')} WHERE id = ?`, values);
      } else {
        throw dbError;
      }
    }
    
    return successResponse(null, 'Fleet unit updated successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await query('DELETE FROM fleet_status WHERE id = ?', [id]);
    return successResponse(null, 'Unit deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
