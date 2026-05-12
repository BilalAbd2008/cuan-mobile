import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { describeAuthServerError } from "@/lib/auth-server-errors";
import { getPool } from "@/lib/db";
import { COOKIE, createToken } from "@/lib/session";

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
    }

    const [rows] = await getPool().query<UserRow[]>(
      `SELECT id, email, password_hash FROM users WHERE email = :email LIMIT 1`,
      { email }
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    const token = await createToken(user.id, user.email);
    const res = NextResponse.json({ message: "Berhasil masuk." });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production"
    });
    return res;
  } catch (error: unknown) {
    console.error(error);
    const message = describeAuthServerError(error, "Gagal masuk.");
    return NextResponse.json({ message }, { status: 500 });
  }
}
