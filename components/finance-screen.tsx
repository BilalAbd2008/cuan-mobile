"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { AppShell, BackTitle } from "@/components/mobile-shell";
import { FinanceManager } from "@/components/finance-manager";

function currentMonthYyyyMm() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function FinanceScreen() {
  const [month, setMonth] = useState(currentMonthYyyyMm);
  const [segment, setSegment] = useState<"all" | "income" | "expense">("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const monthLabel = useMemo(() => {
    const [y, mo] = month.split("-").map(Number);
    if (!y || !mo) return "";
    return new Date(y, mo - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }, [month]);

  return (
    <AppShell active="/finance">
      <BackTitle subtitle="Pantauan arus kas masuk & keluar usahamu" title="Laporan Keuangan" />
      <div className="finance-toolbar">
        <label className="month-pill">
          <CalendarDays />
          <input
            aria-label="Pilih bulan"
            className="month-pill-input"
            onChange={(e) => setMonth(e.target.value)}
            type="month"
            value={month}
          />
          <span className="month-pill-text">{monthLabel}</span>
        </label>
        <button className="finance-add-btn" onClick={() => setSheetOpen(true)} type="button">
          <Plus />
          Tambahkan
        </button>
      </div>
      <div className="segment-control" role="tablist">
        <button className={segment === "all" ? "active" : ""} onClick={() => setSegment("all")} role="tab" type="button">
          Semua
        </button>
        <button className={segment === "income" ? "active" : ""} onClick={() => setSegment("income")} role="tab" type="button">
          Masuk
        </button>
        <button className={segment === "expense" ? "active" : ""} onClick={() => setSegment("expense")} role="tab" type="button">
          Keluar
        </button>
      </div>
      <FinanceManager filterType={segment} month={month} onCloseSheet={() => setSheetOpen(false)} sheetOpen={sheetOpen} />
    </AppShell>
  );
}
