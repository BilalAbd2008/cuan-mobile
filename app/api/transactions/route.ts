import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool, type TransactionType } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type TransactionRow = RowDataPacket & {
  id: number;
  product_id: number | null;
  title: string;
  category: string;
  amount: string;
  type: TransactionType;
  quantity: number | null;
  transaction_date: Date;
  created_at: Date;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = String(searchParams.get("month") ?? "").trim();
    const typeFilter = String(searchParams.get("type") ?? "").trim();
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 200, 1), 500);

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (/^\d{4}-\d{2}$/.test(month)) {
      conditions.push(`DATE_FORMAT(transaction_date, '%Y-%m') = :month`);
      params.month = month;
    }
    if (typeFilter === "income" || typeFilter === "expense") {
      conditions.push(`type = :typeFilter`);
      params.typeFilter = typeFilter;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await getPool().query<TransactionRow[]>(
      `SELECT id, product_id, title, category, amount, type, quantity, transaction_date, created_at
       FROM transactions
       ${where}
       ORDER BY transaction_date DESC, id DESC
       LIMIT ${limit}`,
      params
    );

    const transactions = rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      transaction_date: row.transaction_date.toISOString().slice(0, 10),
      created_at: row.created_at.toISOString()
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data transaksi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const amount = Number(body.amount);
    const type = String(body.type) as TransactionType;
    const productId = body.product_id ? Number(body.product_id) : null;
    const quantity = body.quantity ? Number(body.quantity) : null;
    const transactionDate = String(body.transaction_date ?? "").trim();

    if (!title || !category || !amount || !["income", "expense"].includes(type)) {
      return NextResponse.json({ message: "Data transaksi belum lengkap." }, { status: 400 });
    }

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO transactions (product_id, title, category, amount, type, quantity, transaction_date)
       VALUES (:productId, :title, :category, :amount, :type, :quantity, :transactionDate)`,
      {
        productId,
        title,
        category,
        amount,
        type,
        quantity,
        transactionDate: transactionDate || new Date().toISOString().slice(0, 10)
      }
    );

    return NextResponse.json({ id: result.insertId, message: "Transaksi berhasil disimpan." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menyimpan transaksi." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = Number(body.id);
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const amount = Number(body.amount);
    const type = String(body.type) as TransactionType;
    const productId = body.product_id ? Number(body.product_id) : null;
    const quantity = body.quantity !== undefined && body.quantity !== "" ? Number(body.quantity) : null;
    const transactionDate = String(body.transaction_date ?? "").trim();

    if (!id || !title || !category || !amount || !["income", "expense"].includes(type)) {
      return NextResponse.json({ message: "Data update transaksi belum lengkap." }, { status: 400 });
    }

    await getPool().execute(
      `UPDATE transactions SET
         product_id = :productId,
         title = :title,
         category = :category,
         amount = :amount,
         type = :type,
         quantity = :quantity,
         transaction_date = :transactionDate
       WHERE id = :id`,
      {
        id,
        productId,
        title,
        category,
        amount,
        type,
        quantity,
        transactionDate: transactionDate || new Date().toISOString().slice(0, 10)
      }
    );

    return NextResponse.json({ message: "Transaksi diperbarui." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui transaksi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ message: "ID transaksi wajib diisi." }, { status: 400 });
    }

    await getPool().execute(`DELETE FROM transactions WHERE id = :id`, { id });
    return NextResponse.json({ message: "Transaksi berhasil dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus transaksi." }, { status: 500 });
  }
}
