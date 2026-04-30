import { NextRequest, NextResponse } from "next/server";
import { LogisticsService } from "@/services/logistics.service";

export async function GET() {
  try {
    const data = await LogisticsService.getAll();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await LogisticsService.create(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID is required for update");
    
    const body = await req.json();
    const data = await LogisticsService.update(id, body);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID is required for deletion");
    
    await LogisticsService.delete(id);
    return NextResponse.json({ success: true, message: "Transaction purged" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
