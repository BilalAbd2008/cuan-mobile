import { SignJWT, jwtVerify } from "jose";

const COOKIE = "cuan_token";

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("JWT_SECRET harus diisi (min. 16 karakter) di .env.local");
  }
  return new TextEncoder().encode(raw);
}

export type SessionUser = {
  userId: number;
  email: string;
};

export async function createToken(userId: number, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = payload.sub;
  if (!sub) throw new Error("Token tidak valid");
  const email = typeof payload.email === "string" ? payload.email : "";
  return { userId: Number(sub), email };
}

export { COOKIE };
