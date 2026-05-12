import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  full_name: string;
  business_name: string;
  business_category: string;
  phone: string | null;
  address: string | null;
  created_at: Date;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const [rows] = await getPool().query<UserRow[]>(
      `SELECT id, email, full_name, business_name, business_category, phone, address, created_at
       FROM users WHERE id = :id LIMIT 1`,
      { id: session.userId }
    );
    const u = rows[0];
    if (!u) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        business_name: u.business_name,
        business_category: u.business_category,
        phone: u.phone,
        address: u.address,
        created_at: u.created_at.toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memuat profil." }, { status: 500 });
  }
}
