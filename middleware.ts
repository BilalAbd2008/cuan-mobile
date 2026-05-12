import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Nama cookie sesi — harus sama persis dengan `SESSION_COOKIE` di `lib/auth-constants.ts`.
 * Middleware Edge Vercel tidak boleh `import` file aplikasi (`@/…` maupun relatif), hanya paket seperti `jose`.
 */
const SESSION_COOKIE_NAME = "cuan_token";

export async function middleware(request: NextRequest) {
  const enc = process.env.JWT_SECRET;
  if (!enc || enc.length < 16) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const secret = new TextEncoder().encode(enc);
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/finance", "/products", "/profit", "/hpp/:path*", "/profile"]
};
