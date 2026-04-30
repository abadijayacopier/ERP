import { NextResponse } from 'next/server';

export function successResponse(data: any, message = 'Success', status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status });
}

export function errorResponse(message = 'Internal Server Error', status = 500, code = 'SERVER_ERROR') {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
    },
  }, { status });
}
