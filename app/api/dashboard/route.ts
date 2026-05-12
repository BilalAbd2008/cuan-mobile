import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type TxRow = RowDataPacket & {
  id: number;
  product_id: number | null;
  title: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  quantity: number | null;
  transaction_date: Date;
  created_at: Date;
};

type UserRow = RowDataPacket & {
  full_name: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const [users] = await getPool().query<UserRow[]>(
      `SELECT full_name FROM users WHERE id = :id LIMIT 1`,
      { id: session.userId }
    );
    const fullName = users[0]?.full_name ?? "Pengguna";

    const [todayRows] = await getPool().query<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE transaction_date = CURDATE()`
    );
    const today = todayRows[0] ?? { income: 0, expense: 0 };

    const [recent] = await getPool().query<TxRow[]>(
      `SELECT id, product_id, title, category, amount, type, quantity, transaction_date, created_at
       FROM transactions
       ORDER BY transaction_date DESC, id DESC
       LIMIT 5`
    );

    const recentMapped = recent.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      title: row.title,
      category: row.category,
      amount: Number(row.amount),
      type: row.type,
      quantity: row.quantity,
      transaction_date: row.transaction_date.toISOString().slice(0, 10),
      created_at: row.created_at.toISOString()
    }));

    return NextResponse.json({
      user: { full_name: fullName },
      today: {
        income: Number(today.income),
        expense: Number(today.expense)
      },
      recent: recentMapped
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memuat dashboard." }, { status: 500 });
  }
}
