"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CloudUpload,
  FileOutput,
  HelpCircle,
  LogOut,
  PencilLine,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { AppShell } from "@/components/mobile-shell";

const rows = [
  [FileOutput, "Ekspor semua data", "Backup ke file", "normal", "export"] as const,
  [CloudUpload, "Cadangkan data", "Sinkron data otomatis", "normal", "backup"] as const,
  [Trash2, "Hapus semua data", "Reset aplikasi", "danger", "reset"] as const,
  [ShieldCheck, "Privasi & Keamanan", "Kelola data pribadi", "normal", "privacy"] as const,
  [HelpCircle, "Bantuan & FAQ", "Panduan singkat", "normal", "help"] as const
];

type User = {
  full_name: string;
  business_name: string;
  business_category: string;
  phone: string | null;
  address: string | null;
  email: string;
  created_at: string;
};

export function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    business_category: "",
    phone: "",
    address: ""
  });
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    const d = await r.json();
    if (!d.user) {
      router.replace("/login");
      return;
    }
    setUser(d.user);
    setForm({
      full_name: d.user.full_name,
      business_name: d.user.business_name,
      business_category: d.user.business_category,
      phone: d.user.phone ?? "",
      address: d.user.address ?? ""
    });
  }

  useEffect(() => {
    void load();
  }, [router]);

  function initials(name: string) {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (!p.length) return "?";
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  const joined = user
    ? new Date(user.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const d = await r.json();
    setMessage(d.message ?? "Tersimpan.");
    if (r.ok) {
      setEditOpen(false);
      await load();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  async function handleRow(action: string) {
    if (action === "export") {
      window.open("/api/user/export", "_blank");
      return;
    }
    if (action === "backup") {
      setMessage("Cadangan otomatis: gunakan ekspor file untuk backup lokal.");
      return;
    }
    if (action === "reset") {
      if (!window.confirm("Hapus SEMUA transaksi, produk, dan data HPP? Tindakan ini tidak bisa dibatalkan.")) return;
      const r = await fetch("/api/user/reset-data?confirm=HAPUS", { method: "DELETE" });
      const d = await r.json();
      setMessage(d.message ?? "Selesai.");
      return;
    }
    if (action === "privacy") {
      setMessage("Data disimpan di server Anda (Laragon). Jangan bagikan kredensial database.");
      return;
    }
    setMessage("FAQ: gunakan menu Laporan untuk cek arus kas, Produk untuk HPP & harga jual.");
  }

  if (!user) {
    return (
      <AppShell active="/profile">
        <p className="form-message">Memuat profil…</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="/profile">
      <header className="profile-title">
        <div>
          <h1>Profil Usaha</h1>
          <p>Kelola informasi usahamu</p>
        </div>
        <button aria-label="Edit profil" onClick={() => setEditOpen(true)} type="button">
          <PencilLine />
        </button>
      </header>
      <section className="business-banner">
        <span>{initials(user.business_name)}</span>
        <div>
          <strong>{user.business_name}</strong>
          <p>{user.business_category}</p>
          <p className="banner-sub">Bergabung sejak {joined}</p>
        </div>
      </section>
      <section className="profile-grid-card">
        <span>PEMILIK</span>
        <strong>{user.full_name}</strong>
        <span>TELEPON</span>
        <strong>{user.phone || "—"}</strong>
        <span>ALAMAT</span>
        <strong>{user.address || "—"}</strong>
        <span>EMAIL</span>
        <strong>{user.email}</strong>
      </section>
      <section className="settings-card">
        {rows.map(([Icon, title, subtitle, tone, action]) => (
          <article className={tone} key={action}>
            <button className="settings-row-btn" onClick={() => void handleRow(action)} type="button">
              <Icon />
              <div>
                <strong>{title}</strong>
                {subtitle ? <p>{subtitle}</p> : null}
              </div>
              <b aria-hidden="true">
                &gt;
              </b>
            </button>
          </article>
        ))}
      </section>
      {message ? <p className="form-message profile-msg">{message}</p> : null}
      <button className="logout-button" onClick={() => void logout()} type="button">
        <LogOut size={18} />
        Keluar
      </button>

      {editOpen ? (
        <div className="sheet-overlay" onClick={() => setEditOpen(false)} role="presentation">
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="sheet-panel-head">
              <strong>Edit profil</strong>
              <button className="sheet-close" onClick={() => setEditOpen(false)} type="button">
                Tutup
              </button>
            </div>
            <form className="compact-data-form sheet-form" onSubmit={saveProfile}>
              <label className="field-block">
                <span>Nama pemilik</span>
                <input onChange={(e) => setForm({ ...form, full_name: e.target.value })} value={form.full_name} />
              </label>
              <label className="field-block">
                <span>Nama usaha</span>
                <input onChange={(e) => setForm({ ...form, business_name: e.target.value })} value={form.business_name} />
              </label>
              <label className="field-block">
                <span>Kategori</span>
                <input
                  onChange={(e) => setForm({ ...form, business_category: e.target.value })}
                  value={form.business_category}
                />
              </label>
              <label className="field-block">
                <span>Telepon</span>
                <input onChange={(e) => setForm({ ...form, phone: e.target.value })} value={form.phone} />
              </label>
              <label className="field-block">
                <span>Alamat</span>
                <input onChange={(e) => setForm({ ...form, address: e.target.value })} value={form.address} />
              </label>
              <button className="gradient-action" type="submit">
                Simpan
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
