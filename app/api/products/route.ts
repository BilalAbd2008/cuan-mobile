import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type ProductRow = RowDataPacket & {
  id: number;
  name: string;
  hpp_cost: string;
  sell_price: string;
  image_path: string | null;
  created_at: Date;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const [rows] = await getPool().query<ProductRow[]>(
      `SELECT id, name, hpp_cost, sell_price, image_path, created_at
       FROM products
       ORDER BY id DESC`
    );

    return NextResponse.json({
      products: rows.map((row) => ({
        ...row,
        hpp_cost: Number(row.hpp_cost),
        sell_price: Number(row.sell_price),
        created_at: row.created_at.toISOString()
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil produk." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const hppCost = Number(body.hpp_cost);
    const sellPrice = Number(body.sell_price);
    const imagePath = String(body.image_path ?? "").trim() || null;

    if (!name || !hppCost || !sellPrice) {
      return NextResponse.json({ message: "Data produk belum lengkap." }, { status: 400 });
    }

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO products (name, hpp_cost, sell_price, image_path)
       VALUES (:name, :hppCost, :sellPrice, :imagePath)`,
      { name, hppCost, sellPrice, imagePath }
    );

    return NextResponse.json({ id: result.insertId, message: "Produk berhasil disimpan." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menyimpan produk." }, { status: 500 });
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
    const name = String(body.name ?? "").trim();
    const hppCost = Number(body.hpp_cost);
    const sellPrice = Number(body.sell_price);
    const imagePath = String(body.image_path ?? "").trim() || null;

    if (!id || !name || !hppCost || !sellPrice) {
      return NextResponse.json({ message: "Data update produk belum lengkap." }, { status: 400 });
    }

    await getPool().execute(
      `UPDATE products
       SET name = :name, hpp_cost = :hppCost, sell_price = :sellPrice, image_path = :imagePath
       WHERE id = :id`,
      { id, name, hppCost, sellPrice, imagePath }
    );

    return NextResponse.json({ message: "Produk berhasil diperbarui." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui produk." }, { status: 500 });
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
      return NextResponse.json({ message: "ID produk wajib diisi." }, { status: 400 });
    }

    await getPool().execute(`DELETE FROM products WHERE id = :id`, { id });
    return NextResponse.json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus produk." }, { status: 500 });
  }
}
