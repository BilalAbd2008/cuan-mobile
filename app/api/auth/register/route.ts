import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import { COOKIE, createToken } from "@/lib/session";

const emailOk = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.full_name ?? "").trim();
    const businessName = String(body.business_name ?? "").trim();
    const agree = Boolean(body.agree);

    if (!agree) {
      return NextResponse.json({ message: "Anda harus menyetujui syarat & ketentuan." }, { status: 400 });
    }
    if (!emailOk(email)) {
      return NextResponse.json({ message: "Format email tidak valid." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter." }, { status: 400 });
    }
    if (!fullName || !businessName) {
      return NextResponse.json({ message: "Nama lengkap dan nama usaha wajib diisi." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, full_name, business_name)
       VALUES (:email, :passwordHash, :fullName, :businessName)`,
      { email, passwordHash, fullName, businessName }
    );

    const userId = result.insertId;
    const token = await createToken(userId, email);

    const res = NextResponse.json({ message: "Akun berhasil dibuat.", userId }, { status: 201 });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production"
    });
    return res;
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : "";
    if (code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ message: "Gagal mendaftar." }, { status: 500 });
  }
}
