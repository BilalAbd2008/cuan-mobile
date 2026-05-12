"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          router.replace(d.user ? "/dashboard" : "/login");
        });
    }, 2200);
    return () => window.clearTimeout(timer);
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
      </section>
    </main>
  );
}
