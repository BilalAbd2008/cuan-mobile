import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type SummaryRow = RowDataPacket & {
  omzet: string | null;
  expenses: string | null;
  transaction_count: number;
  total_hpp: string | null;
};

type ProductProfitRow = RowDataPacket & {
  product_id: number;
  name: string;
  image_path: string | null;
  portions: string | null;
  profit: string | null;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = String(searchParams.get("month") ?? "").trim();
    const useMonth = /^\d{4}-\d{2}$/.test(month);

    const summarySql = useMonth
      ? `SELECT
         SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS omzet,
         SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expenses,
         COUNT(*) AS transaction_count,
         SUM(CASE WHEN t.type = 'income' AND p.id IS NOT NULL THEN p.hpp_cost * COALESCE(t.quantity, 0) ELSE 0 END) AS total_hpp
       FROM transactions t
       LEFT JOIN products p ON p.id = t.product_id
       WHERE DATE_FORMAT(t.transaction_date, '%Y-%m') = :month`
      : `SELECT
         SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS omzet,
         SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expenses,
         COUNT(*) AS transaction_count,
         SUM(CASE WHEN t.type = 'income' AND p.id IS NOT NULL THEN p.hpp_cost * COALESCE(t.quantity, 0) ELSE 0 END) AS total_hpp
       FROM transactions t
       LEFT JOIN products p ON p.id = t.product_id`;

    const productSql = useMonth
      ? `SELECT
         p.id AS product_id,
         p.name,
         p.image_path,
         SUM(COALESCE(t.quantity, 0)) AS portions,
         SUM(t.amount - (p.hpp_cost * COALESCE(t.quantity, 0))) AS profit
       FROM products p
       JOIN transactions t ON t.product_id = p.id AND t.type = 'income'
       WHERE DATE_FORMAT(t.transaction_date, '%Y-%m') = :month
       GROUP BY p.id, p.name, p.image_path
       ORDER BY profit DESC
       LIMIT 5`
      : `SELECT
         p.id AS product_id,
         p.name,
         p.image_path,
         SUM(COALESCE(t.quantity, 0)) AS portions,
         SUM(t.amount - (p.hpp_cost * COALESCE(t.quantity, 0))) AS profit
       FROM products p
       JOIN transactions t ON t.product_id = p.id AND t.type = 'income'
       GROUP BY p.id, p.name, p.image_path
       ORDER BY profit DESC
       LIMIT 5`;

    const params = useMonth ? { month } : {};

    const [summaryRows] = await getPool().query<SummaryRow[]>(summarySql, params);
    const [productRows] = await getPool().query<ProductProfitRow[]>(productSql, params);

    const summary = summaryRows[0];
    const omzet = Number(summary?.omzet ?? 0);
    const expenses = Number(summary?.expenses ?? 0);
    const totalHpp = Number(summary?.total_hpp ?? 0);

    return NextResponse.json({
      month: useMonth ? month : null,
      summary: {
        omzet,
        expenses,
        total_hpp: totalHpp,
        net_profit: omzet - totalHpp - expenses,
        transaction_count: Number(summary?.transaction_count ?? 0)
      },
      products: productRows.map((row) => ({
        id: row.product_id,
        name: row.name,
        image_path: row.image_path,
        portions: Number(row.portions ?? 0),
        profit: Number(row.profit ?? 0)
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghitung laporan laba." }, { status: 500 });
  }
}
