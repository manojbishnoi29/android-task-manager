import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      offline: true,
      settings: {
        theme: body.theme,
        accentColor: body.accentColor,
        soundEnabled: body.soundEnabled,
        hapticEnabled: body.hapticEnabled,
        autoSaveLocal: body.autoSaveLocal,
        name: body.name,
      },
      message: "Settings received in offline mode",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid settings data",
      },
      { status: 400 }
    );
  }
}