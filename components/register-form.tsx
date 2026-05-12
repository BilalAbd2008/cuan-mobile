"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/brand";

const emailOk = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) router.replace("/dashboard");
      });
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!fullName.trim() || !businessName.trim()) {
      setMessage("Nama lengkap dan nama usaha wajib diisi.");
      return;
    }
    if (!emailOk(email)) {
      setMessage("Format email tidak valid.");
      return;
    }
    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }
    if (!agree) {
      setMessage("Centang persetujuan syarat & ketentuan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          business_name: businessName.trim(),
          email: email.trim().toLowerCase(),
          password,
          agree: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Gagal mendaftar.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-frame register-frame">
        <div className="auth-brand-row">
          <BrandMark compact />
          <strong>CUANIN</strong>
        </div>
        <div className="auth-heading compact">
          <h1>Buat Akun Baru</h1>
          <p>Daftar untuk kelola usahamu</p>
        </div>
        <form className="auth-form dense" onSubmit={onSubmit}>
          <label>
            NAMA LENGKAP
            <input onChange={(ev) => setFullName(ev.target.value)} placeholder="Budi Santoso" value={fullName} />
          </label>
          <label>
            NAMA USAHA
            <input
              onChange={(ev) => setBusinessName(ev.target.value)}
              placeholder="Warung Alam Indah Budi Jaya"
              value={businessName}
            />
          </label>
          <label>
            EMAIL
            <input
              autoComplete="email"
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="contoh@gmail.com"
              type="email"
              value={email}
            />
          </label>
          <label>
            PASSWORD
            <input
              autoComplete="new-password"
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Min. 8 karakter"
              type="password"
              value={password}
            />
          </label>
          <label className="agree-row">
            <input checked={agree} onChange={(ev) => setAgree(ev.target.checked)} type="checkbox" />
            <span>Saya menyetujui syarat &amp; ketentuan</span>
          </label>
          <button className="gradient-button" disabled={loading} type="submit">
            {loading ? "Memproses…" : "Daftar"}
          </button>
          {message ? <p className="form-message form-message-error">{message}</p> : null}
        </form>
        <p className="auth-switch">
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </section>
    </main>
  );
}
