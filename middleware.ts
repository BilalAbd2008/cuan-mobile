import { type NextRequest, NextResponse } from "next/server";

/**
 * Harus sama dengan `SESSION_COOKIE` di `lib/auth-constants.ts`.
 * Middleware Edge tidak boleh mengimpor file proyek atau paket tambahan (hindari `jose` di sini).
 */
const SESSION_COOKIE_NAME = "cuan_token";

function base64UrlToBytes(s: string): Uint8Array {
  let str = s.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i] ^ b[i];
  return x === 0;
}

/** Verifikasi JWT HS256 — harus selaras dengan token dari `jose` di `lib/session.ts`. */
async function verifyJwtHs256Edge(token: string, secret: Uint8Array): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h64, p64, sig64] = parts;
  let sig: Uint8Array;
  try {
    sig = base64UrlToBytes(sig64);
  } catch {
    return false;
  }
  const signingBytes = new TextEncoder().encode(`${h64}.${p64}`);
  const keyMaterial = new Uint8Array(secret);
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, signingBytes));
  if (!timingSafeEqual(mac, sig)) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(p64))) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    if (payload.exp * 1000 <= Date.now()) return false;
  } catch {
    return false;
  }
  return true;
}

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
  const ok = await verifyJwtHs256Edge(token, secret);
  if (!ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/finance", "/products", "/profit", "/hpp/:path*", "/profile"]
};
