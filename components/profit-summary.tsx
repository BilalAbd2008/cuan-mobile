"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { ProductCard } from "@/components/cards";
import { formatShortRp, monthLabelYyyyMm } from "@/lib/format";

type ProfitPayload = {
  month: string | null;
  summary: {
    omzet: number;
    total_hpp: number;
    expenses: number;
    net_profit: number;
    transaction_count: number;
  };
  products: Array<{
    id: number;
    name: string;
    image_path: string | null;
    portions: number;
    profit: number;
  }>;
};

function currentMonthYyyyMm() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ProfitSummary() {
  const [month, setMonth] = useState(currentMonthYyyyMm);
  const [data, setData] = useState<ProfitPayload | null>(null);

  useEffect(() => {
    fetch(`/api/profit?month=${encodeURIComponent(month)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null));
  }, [month]);

  const summary = data?.summary ?? {
    omzet: 0,
    total_hpp: 0,
    expenses: 0,
    net_profit: 0,
    transaction_count: 0
  };
  const products = data?.products ?? [];
  const monthLabel = monthLabelYyyyMm(month);

  const omzetLabel = useMemo(() => formatShortRp(summary.omzet), [summary.omzet]);
  const hppLabel = useMemo(() => formatShortRp(summary.total_hpp), [summary.total_hpp]);

  return (
    <>
      <label className="profit-month-bar">
        <span>Bulan laporan</span>
        <input onChange={(e) => setMonth(e.target.value)} type="month" value={month} />
      </label>
      <section className="profit-hero">
        <div>
          <p>LABA BERSIH BULAN INI</p>
          <strong>Rp {Math.round(summary.net_profit).toLocaleString("id-ID")}</strong>
          <span>{monthLabel}</span>
        </div>
        <i>
          <ChartNoAxesCombined />
        </i>
      </section>
      <div className="profit-metrics">
        <article>
          <span>TOTAL OMSET</span>
          <strong>{omzetLabel}</strong>
        </article>
        <article>
          <span>TOTAL HPP</span>
          <strong>{hppLabel}</strong>
        </article>
        <article>
          <span>TRANSAKSI</span>
          <strong>{summary.transaction_count}</strong>
        </article>
      </div>
      <section className="list-section profit-list">
        <h2>LABA PER PRODUK</h2>
        {products.map((product) => (
          <ProductCard
            hpp={`${product.portions} Porsi`}
            image={product.image_path ?? "/assets/seafood.png"}
            key={product.id}
            margin=""
            price={formatShortRp(product.profit)}
            title={product.name}
          />
        ))}
      </section>
    </>
  );
}
