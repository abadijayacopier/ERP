import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const steps = [];
    
    try {
      await query('ALTER TABLE activity_logs ADD COLUMN ip_address VARCHAR(45) AFTER details');
      steps.push('Added ip_address column');
    } catch (e: any) {
      steps.push(`ip_address: ${e.message}`);
    }

    try {
      await query('ALTER TABLE activity_logs ADD COLUMN user_agent TEXT AFTER ip_address');
      steps.push('Added user_agent column');
    } catch (e: any) {
      steps.push(`user_agent: ${e.message}`);
    }

    return NextResponse.json({ success: true, steps });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
