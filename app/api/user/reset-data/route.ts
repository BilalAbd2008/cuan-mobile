import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("confirm") !== "HAPUS") {
    return NextResponse.json({ message: 'Tambahkan query ?confirm=HAPUS untuk menghapus semua data usaha.' }, { status: 400 });
  }

  try {
    const pool = getPool();
    await pool.execute(`DELETE FROM transactions`);
    await pool.execute(`DELETE FROM hpp_calculations`);
    await pool.execute(`DELETE FROM products`);
    return NextResponse.json({ message: "Semua data transaksi, HPP, dan produk telah dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus data." }, { status: 500 });
  }
}
