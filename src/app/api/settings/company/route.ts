import { query } from '@/lib/db';

export async function GET() {
  try {
    const [settings]: any = await query('SELECT * FROM company_settings LIMIT 1');
    return new Response(JSON.stringify(settings || {}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, email, website, phone } = body;

    // Check if settings exist
    const [existing]: any = await query('SELECT id FROM company_settings LIMIT 1');

    if (existing) {
      await query(
        'UPDATE company_settings SET company_name = ?, address = ?, email = ?, website = ?, phone = ? WHERE id = ?',
        [name, address, email, website, phone, existing.id]
      );
    } else {
      await query(
        'INSERT INTO company_settings (company_name, address, email, website, phone) VALUES (?, ?, ?, ?, ?)',
        [name, address, email, website, phone]
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
