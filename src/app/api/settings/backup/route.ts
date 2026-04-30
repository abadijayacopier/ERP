import { NextResponse } from "next/server";
import { SettingsService } from "@/services/settings.service";

export async function POST() {
  try {
    const result = await SettingsService.backupDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
