import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const logs = await query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user_name, action, module, details } = await request.json();
    const result = await query(
      'INSERT INTO activity_logs (user_name, action, module, details) VALUES (?, ?, ?, ?)',
      [user_name, action, module, details]
    );
    return NextResponse.json({ id: (result as any).insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
