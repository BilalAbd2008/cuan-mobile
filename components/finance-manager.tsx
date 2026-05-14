"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import { TransactionCard } from "@/components/cards";
import { transactions as fallbackTransactions } from "@/components/mock-data";

type TransactionItem = {
  id?: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  quantity?: number | null;
  transaction_date?: string;
};

const emptyForm = (type: "income" | "expense"): TransactionItem => ({
  title: "",
  category: type === "expense" ? "Operasional" : "Penjualan",
  amount: 0,
  type,
  quantity: null,
  transaction_date: new Date().toISOString().slice(0, 10)
});

function cleanNumericInput(event: ChangeEvent<HTMLInputElement>) {
  const normalized = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (event.target.value !== normalized) event.target.value = normalized;
  return Number(normalized || 0);
}

function detailLine(t: TransactionItem) {
  const d = t.transaction_date ?? new Date().toISOString().slice(0, 10);
  const date = new Date(d + "T12:00:00");
  const dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  if (t.type === "income" && t.quantity != null && t.quantity > 0) {
    return `${t.quantity} Porsi · ${dateStr}`;
  }
  return dateStr;
}

export function FinanceManager({
  month,
  filterType,
  sheetOpen,
  onCloseSheet
}: {
  month: string;
  filterType: "all" | "income" | "expense";
  sheetOpen: boolean;
  onCloseSheet: () => void;
}) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [form, setForm] = useState<TransactionItem>(emptyForm("income"));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const typeParam = filterType === "all" ? "" : filterType;
  const modalOpen = sheetOpen || editingId !== null;

  async function loadTransactions() {
    try {
      const qs = new URLSearchParams();
      qs.set("month", month);
      if (typeParam) qs.set("type", typeParam);
      qs.set("limit", "300");
      const response = await fetch(`/api/transactions?${qs.toString()}`, { cache: "no-store" });
      if (response.status === 401) {
        setTransactions([]);
        return;
      }
      if (!response.ok) throw new Error("fallback");
      const data = await response.json();
      setTransactions(data.transactions);
    } catch {
      setTransactions(
        fallbackTransactions.map(([title, detail, amount, type], index) => ({
          id: index + 1,
          title,
          category: detail || "Operasional",
          amount: Number(String(amount).replace(/\D/g, "")),
          type,
          transaction_date: new Date().toISOString().slice(0, 10)
        }))
      );
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, [month, typeParam]);

  useEffect(() => {
    if (sheetOpen && editingId === null) {
      const t = filterType === "expense" ? "expense" : "income";
      setForm(emptyForm(t));
      setMessage("");
    }
  }, [sheetOpen, editingId, filterType]);

  function closeModal() {
    setEditingId(null);
    setMessage("");
    onCloseSheet();
  }

  async function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { ...form, id: editingId } : form;
    const response = await fetch("/api/transactions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setMessage(data.message ?? "Transaksi tersimpan.");
    if (response.ok) {
      closeModal();
      await loadTransactions();
    }
  }

  async function deleteTransaction(id?: number) {
    if (!id) return;
    if (!window.confirm("Hapus transaksi ini?")) return;
    const response = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(data.message ?? "Transaksi dihapus.");
    if (response.ok) await loadTransactions();
  }

  return (
    <>
      <div className="stack-list finance-list">
        {transactions.map((transaction) => (
          <div className="ledger-row-managed" key={transaction.id ?? transaction.title}>
            <TransactionCard
              amount={`${transaction.type === "income" ? "+" : "-"} Rp ${transaction.amount.toLocaleString("id-ID")}`}
              detail={transaction.category}
              secondary={detailLine(transaction)}
              title={transaction.title}
              type={transaction.type}
            />
            <div className="ledger-row-actions">
              <button
                aria-label="Edit"
                className="icon-slate-btn"
                onClick={() => {
                  setEditingId(transaction.id ?? null);
                  setForm({
                    title: transaction.title,
                    category: transaction.category,
                    amount: transaction.amount,
                    type: transaction.type,
                    quantity: transaction.quantity ?? null,
                    transaction_date: transaction.transaction_date ?? new Date().toISOString().slice(0, 10)
                  });
                  setMessage("");
                }}
                type="button"
              >
                <PencilLine size={18} />
              </button>
              <button
                aria-label="Hapus"
                className="icon-slate-btn"
                onClick={() => void deleteTransaction(transaction.id)}
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen ? (
        <div className="sheet-overlay" onClick={closeModal} role="presentation">
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="sheet-panel-head">
              <strong>{editingId ? "Edit transaksi" : "Tambah transaksi"}</strong>
              <button className="sheet-close" onClick={closeModal} type="button">
                Tutup
              </button>
            </div>
            <form className="compact-data-form sheet-form" onSubmit={submitTransaction}>
              <label className="field-block">
                <span>Judul</span>
                <input
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Judul transaksi"
                  value={form.title}
                />
              </label>
              <label className="field-block">
                <span>Kategori</span>
                <input
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="Kategori"
                  value={form.category}
                />
              </label>
              <label className="field-block">
                <span>Nominal</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => setForm({ ...form, amount: cleanNumericInput(event) })}
                  pattern="[0-9]*"
                  placeholder="Nominal"
                  type="text"
                  value={form.amount || ""}
                />
              </label>
              <label className="field-block">
                <span>Tanggal</span>
                <input
                  onChange={(event) => setForm({ ...form, transaction_date: event.target.value })}
                  type="date"
                  value={form.transaction_date ?? ""}
                />
              </label>
              <label className="field-block">
                <span>Jumlah porsi (opsional)</span>
                <input
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value === "" ? null : cleanNumericInput(event) })
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Untuk penjualan"
                  type="text"
                  value={form.quantity ?? ""}
                />
              </label>
              <label className="field-block">
                <span>Jenis</span>
                <select
                  onChange={(event) => setForm({ ...form, type: event.target.value as TransactionItem["type"] })}
                  value={form.type}
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </label>
              <button className="gradient-action" type="submit">
                {editingId ? "Simpan perubahan" : "Simpan transaksi"}
              </button>
              {message ? <p className="form-message">{message}</p> : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
