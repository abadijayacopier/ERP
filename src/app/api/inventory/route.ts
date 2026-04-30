import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let results;
    if (type === 'Sparepart') {
      results = await query('SELECT * FROM spareparts ORDER BY name ASC');
    } else if (type === 'Fuel') {
      results = await query('SELECT * FROM general_inventory WHERE category = "Fuel" ORDER BY item_name ASC');
    } else {
      results = await query('SELECT * FROM general_inventory ORDER BY item_name ASC');
    }
    return successResponse(results);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_name, category, stock_quantity, unit, min_stock_level, location } = body;

    const result: any = await query(
      'INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES (?, ?, ?, ?, ?, ?)',
      [item_name, category, stock_quantity, unit, min_stock_level, location]
    );

    return successResponse({ id: result.insertId }, 'Item added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (type === 'Sparepart') {
      await query('DELETE FROM spareparts WHERE id = ?', [id]);
    } else {
      await query('DELETE FROM general_inventory WHERE id = ?', [id]);
    }
    return successResponse(null, 'Item deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
