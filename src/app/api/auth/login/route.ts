import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-erp-pro-max-2026';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }

    const user = await UserService.findByUsername(username);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid Operator ID or Security Key' }, { status: 401 });
    }
    
    if (!user.password) {
      return NextResponse.json({ success: false, message: 'Invalid Operator ID or Security Key' }, { status: 401 });
    }

    const isValid = await UserService.verifyLogin(username, password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid Operator ID or Security Key' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        full_name: user.full_name,
        department: user.department 
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: user
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
