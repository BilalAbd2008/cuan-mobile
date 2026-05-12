"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BrandMark } from "@/components/brand";

const emailOk = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    if (!emailOk(email)) {
      setMessage("Periksa format email.");
      return;
    }
    if (!password) {
      setMessage("Password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Gagal masuk.");
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
      <section className="auth-frame">
        <div className="auth-brand-row">
          <BrandMark compact />
          <strong>CUANIN</strong>
        </div>
        <div className="auth-heading">
          <h1>Selamat Datang</h1>
          <p>Masuk untuk kelola usahamu</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
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
            <span className="password-field">
              <input
                autoComplete="current-password"
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="••••••••"
                type={show ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                className="password-toggle"
                onClick={() => setShow((s) => !s)}
                type="button"
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
          <button className="gradient-button" disabled={loading} type="submit">
            {loading ? "Memproses…" : "Masuk"}
          </button>
          {message ? <p className="form-message form-message-error">{message}</p> : null}
        </form>
        <div className="auth-divider">
          <span />
          <em>atau</em>
          <span />
        </div>
        <p className="auth-switch">
          Belum punya akun? <Link href="/register">Daftar Sekarang</Link>
        </p>
      </section>
    </main>
  );
}
