import { NextRequest, NextResponse } from "next/server";
import { runBackupExport } from "@/lib/cronTasks";

export const dynamic = "force-dynamic";

// Callable standalone for manual testing — the scheduled Vercel Cron job in
// vercel.json actually hits /api/system/cron/weekly-tasks, which runs this
// same export (via lib/cronTasks.ts) alongside the weekly report under one
// cron-job slot. Not a substitute for Neon's own database backups, just an
// extra, independently-held copy of the data that actually matters
// day-to-day.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const counts = await runBackupExport();
    return NextResponse.json({ ok: true, counts });
  } catch (err) {
    console.error("Failed to send backup email:", err);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }
}
