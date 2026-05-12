import { cookies } from "next/headers";
import { COOKIE, verifyToken, type SessionUser } from "@/lib/session";

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
