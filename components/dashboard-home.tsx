"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Box,
  Calculator,
  ChartNoAxesCombined,
  ReceiptText
} from "lucide-react";
import { AppShell } from "@/components/mobile-shell";
import { TransactionCard } from "@/components/cards";
import { formatShortRp, greetingForHour } from "@/lib/format";

type Tx = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  quantity: number | null;
  transaction_date: string;
};

export function DashboardHome() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Pengguna");
  const [todayIn, setTodayIn] = useState(0);
  const [todayOut, setTodayOut] = useState(0);
  const [recent, setRecent] = useState<Tx[]>([]);

  useEffect(() => {
    void fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setFullName(d.user?.full_name ?? "Pengguna");
        setTodayIn(Number(d.today?.income ?? 0));
        setTodayOut(Number(d.today?.expense ?? 0));
        setRecent(Array.isArray(d.recent) ? d.recent : []);
      });
  }, [router]);

  function initials(name: string) {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (!p.length) return "?";
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  function txDetail(t: Tx) {
    const date = new Date(t.transaction_date + "T12:00:00");
    const dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (t.type === "income" && t.quantity != null && t.quantity > 0) {
      return `${t.quantity} Porsi · ${dateStr}`;
    }
    return dateStr;
  }

  function txAmount(t: Tx) {
    const sign = t.type === "income" ? "+" : "-";
    return `${sign} Rp ${t.amount.toLocaleString("id-ID")}`;
  }

  return (
    <AppShell active="/dashboard">
      <header className="dashboard-head">
        <span className="avatar-chip">{initials(fullName)}</span>
        <div>
          <p>{greetingForHour()},</p>
          <h1>{fullName}</h1>
        </div>
        <button aria-label="Notifikasi" type="button">
          <Bell />
        </button>
      </header>
      <section className="hero-summary">
        <p>RINGKASAN HARI INI</p>
        <div>
          <article>
            <span>
              <ArrowUpRight /> Pemasukan
            </span>
            <strong>{formatShortRp(todayIn)}</strong>
          </article>
          <article>
            <span>
              <ArrowDownLeft /> Pengeluaran
            </span>
            <strong>{formatShortRp(todayOut)}</strong>
          </article>
        </div>
      </section>
      <section className="menu-block">
        <h2>MENU UTAMA</h2>
        <div className="menu-grid">
          <Link className="menu-tile" href="/hpp">
            <article>
              <Calculator />
              <span>Kalkulator HPP</span>
            </article>
          </Link>
          <Link className="menu-tile" href="/finance">
            <article>
              <ReceiptText />
              <span>Lap. Keuangan</span>
            </article>
          </Link>
          <Link className="menu-tile" href="/products">
            <article>
              <Box />
              <span>Produk</span>
            </article>
          </Link>
          <Link className="menu-tile" href="/profit">
            <article>
              <ChartNoAxesCombined />
              <span>Lap. Laba</span>
            </article>
          </Link>
        </div>
      </section>
      <section className="list-section">
        <div className="title-row">
          <h2>TRANSAKSI TERBARU</h2>
          <Link href="/finance">
            <span>Lihat semua</span>
          </Link>
        </div>
        <div className="stack-list">
          {recent.map((t) => (
            <TransactionCard
              amount={txAmount(t)}
              detail={t.category}
              key={t.id}
              secondary={txDetail(t)}
              title={t.title}
              type={t.type}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
