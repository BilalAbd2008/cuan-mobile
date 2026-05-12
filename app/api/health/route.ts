import { NextResponse } from "next/server";

/** Cek deployment + keberadaan env penting (tanpa mengekspos nilai rahasia). */
export function GET() {
  const hasJwt = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16);
  const hasMysqlCore = Boolean(
    process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER
  );
  return NextResponse.json({
    ok: true,
    service: "cuan-mobile",
    env: {
      jwt_secret_configured: hasJwt,
      mysql_core_configured: hasMysqlCore
    }
  });
}
