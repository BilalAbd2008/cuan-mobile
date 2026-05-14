"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand";

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(100, Math.round((elapsed / 2200) * 100)));
    }, 40);
    const timer = window.setTimeout(() => {
      void fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          router.replace(d.user ? "/dashboard" : "/login");
        });
    }, 2400);
    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="auth-shell splash-screen">
      <section className="splash-brand" aria-label="Memuat aplikasi Cuanin">
        <BrandMark large />
        <strong>CUANIN</strong>
        <span>HITUNG HPP-MU, KEMBANGKAN USAHAMU.</span>
        <div className="splash-loader">
          <i />
        </div>
        <p className="splash-progress">Loading {progress}%</p>
      </section>
    </main>
  );
}
