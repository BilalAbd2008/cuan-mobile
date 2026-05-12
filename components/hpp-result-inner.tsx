"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Save } from "lucide-react";

export function HppResultInner() {
  const sp = useSearchParams();
  const name = sp.get("name") ?? "Produk";
  const hpp = Number(sp.get("hpp") ?? 0);
  const price = Number(sp.get("price") ?? 0);
  const margin = Number(sp.get("margin") ?? 30);

  return (
    <>
      <p className="hpp-result-name">{name}</p>
      <section className="result-card">
        <p>HPP PER PORSI</p>
        <strong>Rp {hpp.toLocaleString("id-ID")}</strong>
        <p>MARGIN YANG DIPEROLEH</p>
        <div className="margin-tabs margin-tabs-static">
          {[30, 50, 100].map((m) => (
            <span className={margin === m ? "active" : ""} key={m}>
              {m}%
            </span>
          ))}
        </div>
        <div className="result-line">
          <span>HARGA JUAL DISARANKAN</span>
          <b>Rp {price.toLocaleString("id-ID")}</b>
        </div>
      </section>
      <Link className="gradient-action hpp-result-back" href="/hpp">
        <Save size={20} />
        Hitung lagi
      </Link>
    </>
  );
}
