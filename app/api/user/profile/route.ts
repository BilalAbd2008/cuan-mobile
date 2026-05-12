import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fullName = String(body.full_name ?? "").trim();
    const businessName = String(body.business_name ?? "").trim();
    const businessCategory = String(body.business_category ?? "").trim();
    const phone = String(body.phone ?? "").trim() || null;
    const address = String(body.address ?? "").trim() || null;

    if (!fullName || !businessName) {
      return NextResponse.json({ message: "Nama dan nama usaha wajib diisi." }, { status: 400 });
    }

    await getPool().execute(
      `UPDATE users SET
         full_name = :fullName,
         business_name = :businessName,
         business_category = :businessCategory,
         phone = :phone,
         address = :address
       WHERE id = :id`,
      {
        fullName,
        businessName,
        businessCategory: businessCategory || "Makanan dan Minuman",
        phone,
        address,
        id: session.userId
      }
    );

    return NextResponse.json({ message: "Profil diperbarui." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui profil." }, { status: 500 });
  }
}
