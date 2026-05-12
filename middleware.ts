import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const enc = process.env.JWT_SECRET;
  if (!enc || enc.length < 16) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const secret = new TextEncoder().encode(enc);
  const token = request.cookies.get(COOKIE)?.value;
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
