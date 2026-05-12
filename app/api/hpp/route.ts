import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

type RawMaterialPayload = {
  name?: string;
  price?: number;
  unit?: string;
};

type OperationalCostPayload = {
  name?: string;
  amount?: number;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productName = String(body.product_name ?? "").trim();
    const productionQty = Number(body.production_qty);
    const marginPercent = Number(body.margin_percent ?? 30);
    const rawMaterials: RawMaterialPayload[] = Array.isArray(body.raw_materials) ? body.raw_materials : [];
    const operationalCosts: OperationalCostPayload[] = Array.isArray(body.operational_costs) ? body.operational_costs : [];

    const materialTotal = rawMaterials.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const operationalTotal = operationalCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    if (!productName || !productionQty || materialTotal <= 0) {
      return NextResponse.json({ message: "Data HPP belum lengkap." }, { status: 400 });
    }

    const hppPerPortion = (materialTotal + operationalTotal) / productionQty;
    const suggestedPrice = hppPerPortion * (1 + marginPercent / 100);

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO hpp_calculations (
        product_name, production_qty, total_material_cost, total_operational_cost,
        hpp_per_portion, margin_percent, suggested_price, raw_materials, operational_costs
      ) VALUES (
        :productName, :productionQty, :materialTotal, :operationalTotal,
        :hppPerPortion, :marginPercent, :suggestedPrice, :rawMaterials, :operationalCosts
      )`,
      {
        productName,
        productionQty,
        materialTotal,
        operationalTotal,
        hppPerPortion,
        marginPercent,
        suggestedPrice,
        rawMaterials: JSON.stringify(rawMaterials),
        operationalCosts: JSON.stringify(operationalCosts)
      }
    );

    return NextResponse.json(
      {
        id: result.insertId,
        hpp_per_portion: hppPerPortion,
        suggested_price: suggestedPrice,
        margin_percent: marginPercent
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menyimpan HPP." }, { status: 500 });
  }
}
