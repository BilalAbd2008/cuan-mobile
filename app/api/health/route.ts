import { NextResponse } from "next/server";

/** Cek cepat bahwa deployment hidup (buka /api/health di browser). */
export function GET() {
  return NextResponse.json({ ok: true, service: "cuan-mobile" });
}
