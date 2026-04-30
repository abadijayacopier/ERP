import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { UserService } from '@/services/user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-erp-pro-max-2026';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Fetch latest user data (optional, but good practice to ensure user is still active)
    const user = await UserService.findByUsername(decoded.username);
    
    if (!user || !user.is_active) {
       // Clear cookie if user not found or inactive
       const response = NextResponse.json({ success: false, message: 'User inactive or not found' }, { status: 401 });
       response.cookies.delete('auth_token');
       return response;
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  }
}
