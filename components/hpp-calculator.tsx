"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { Save } from "lucide-react";

type CostRow = { name: string; price: number; unit?: string };

function cleanNumericInput(event: ChangeEvent<HTMLInputElement>) {
  const normalized = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (event.target.value !== normalized) event.target.value = normalized;
  return Number(normalized || 0);
}

export function HppCalculator() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [productionQty, setProductionQty] = useState(50);
  const [marginPercent, setMarginPercent] = useState(30);
  const [materials, setMaterials] = useState<CostRow[]>([
    { name: "Beras", price: 70000, unit: "5Kg" },
    { name: "Kecap", price: 15000, unit: "1Kg" }
  ]);
  const [operational, setOperational] = useState<CostRow[]>([
    { name: "Biaya Gas", price: 22000 },
    { name: "Biaya Listrik", price: 20000 }
  ]);
  const [result, setResult] = useState<{ hpp: number; price: number } | null>(null);
  const [message, setMessage] = useState("");

  const computedHpp =
    (materials.reduce((sum, item) => sum + item.price, 0) +
      operational.reduce((sum, item) => sum + item.price, 0)) /
    Math.max(productionQty, 1);
  const computedPrice = computedHpp * (1 + marginPercent / 100);

  async function saveCalculation() {
    const response = await fetch("/api/hpp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: productName || "Produk",
        production_qty: productionQty,
        margin_percent: marginPercent,
        raw_materials: materials.map((item) => ({ name: item.name, price: item.price, unit: item.unit })),
        operational_costs: operational.map((item) => ({ name: item.name, amount: item.price }))
      })
    });
    const data = await response.json();
    setMessage(data.message ?? "Perhitungan berhasil disimpan.");
    if (response.ok) {
      const hpp = data.hpp_per_portion ?? computedHpp;
      const price = data.suggested_price ?? computedPrice;
      setResult({ hpp, price });
      const q = new URLSearchParams({
        hpp: String(Math.round(hpp)),
        price: String(Math.round(price)),
        margin: String(marginPercent),
        name: productName || "Produk"
      });
      router.push(`/hpp/result?${q.toString()}`);
    }
  }

  return (
    <>
      <section className="form-card">
        <h2>Info Produk</h2>
        <label className="field-block">
          <span>NAMA PRODUK</span>
          <input
            onChange={(event) => setProductName(event.target.value)}
            placeholder="cth: nasi goreng"
            value={productName}
          />
        </label>
        <label className="field-block">
          <span>JUMLAH PRODUKSI (PORSI)</span>
          <input
            min={1}
            inputMode="numeric"
            onChange={(event) => setProductionQty(cleanNumericInput(event))}
            pattern="[0-9]*"
            type="text"
            value={productionQty || ""}
          />
        </label>
      </section>
      <section className="table-card">
        <div className="title-row">
          <h2>Bahan Baku</h2>
          <button
            className="text-action-btn"
            onClick={() => setMaterials((rows) => [...rows, { name: "", price: 0, unit: "" }])}
            type="button"
          >
            + Tambahkan
          </button>
        </div>
        <div className="mini-grid labels">
          <span>BAHAN</span>
          <span>HARGA</span>
          <span>SATUAN</span>
          <span />
        </div>
        {materials.map((item, index) => (
          <div className="mini-grid live-grid" key={`m-${index}`}>
            <input
              onChange={(event) =>
                setMaterials((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, name: event.target.value } : row)))
              }
              value={item.name}
            />
            <input
              onChange={(event) =>
                setMaterials((rows) =>
                  rows.map((row, rowIndex) => (rowIndex === index ? { ...row, price: cleanNumericInput(event) } : row))
                )
              }
              inputMode="numeric"
              pattern="[0-9]*"
              type="text"
              value={item.price || ""}
            />
            <input
              onChange={(event) =>
                setMaterials((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, unit: event.target.value } : row)))
              }
              value={item.unit ?? ""}
            />
            <button onClick={() => setMaterials((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
              ×
            </button>
          </div>
        ))}
      </section>
      <section className="table-card operational">
        <div className="title-row">
          <h2>Biaya Operasional</h2>
          <button
            className="text-action-btn"
            onClick={() => setOperational((rows) => [...rows, { name: "", price: 0 }])}
            type="button"
          >
            + Tambahkan
          </button>
        </div>
        {operational.map((item, index) => (
          <div className="cost-grid live-grid" key={`o-${index}`}>
            <input
              onChange={(event) =>
                setOperational((rows) =>
                  rows.map((row, rowIndex) => (rowIndex === index ? { ...row, name: event.target.value } : row))
                )
              }
              value={item.name}
            />
            <input
              onChange={(event) =>
                setOperational((rows) =>
                  rows.map((row, rowIndex) => (rowIndex === index ? { ...row, price: cleanNumericInput(event) } : row))
                )
              }
              inputMode="numeric"
              pattern="[0-9]*"
              type="text"
              value={item.price || ""}
            />
            <button onClick={() => setOperational((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
              ×
            </button>
          </div>
        ))}
      </section>
      <section className="result-card">
        <p>HPP PER PORSI</p>
        <strong>Rp {Math.round(result?.hpp ?? computedHpp).toLocaleString("id-ID")}</strong>
        <p>MARGIN YANG DIPEROLEH</p>
        <div className="margin-tabs">
          {[30, 50, 100].map((margin) => (
            <button className={marginPercent === margin ? "active" : ""} key={margin} onClick={() => setMarginPercent(margin)} type="button">
              {margin}%
            </button>
          ))}
        </div>
        <div className="result-line">
          <span>Harga Jual Disarankan</span>
          <b>Rp {Math.round(result?.price ?? computedPrice).toLocaleString("id-ID")}</b>
        </div>
      </section>
      <button className="gradient-action" onClick={() => void saveCalculation()} type="button">
        <Save size={20} />
        Simpan Perhitungan
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </>
  );
}
