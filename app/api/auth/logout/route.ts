import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ message: "Berhasil keluar." });
  res.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
