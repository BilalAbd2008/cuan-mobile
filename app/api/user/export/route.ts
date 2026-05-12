import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const [transactions] = await getPool().query<RowDataPacket[]>(
      `SELECT id, product_id, title, category, amount, type, quantity, transaction_date, created_at FROM transactions ORDER BY id`
    );
    const [products] = await getPool().query<RowDataPacket[]>(`SELECT * FROM products ORDER BY id`);
    const [hpp] = await getPool().query<RowDataPacket[]>(`SELECT * FROM hpp_calculations ORDER BY id`);

    const payload = { exportedAt: new Date().toISOString(), transactions, products, hpp_calculations: hpp };
    const body = JSON.stringify(payload, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="cuan-backup-${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengekspor data." }, { status: 500 });
  }
}
