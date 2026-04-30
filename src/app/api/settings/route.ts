import { NextResponse } from "next/server";
import { SettingsService } from "@/services/settings.service";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const result = await SettingsService.updateSettings(data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
