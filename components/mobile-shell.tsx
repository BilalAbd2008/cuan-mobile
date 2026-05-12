import Link from "next/link";
import {
  Box,
  Calculator,
  ChartNoAxesCombined,
  House,
  ReceiptText,
  UserRound
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/hpp", label: "HPP", icon: Calculator },
  { href: "/finance", label: "Laporan", icon: ReceiptText },
  { href: "/products", label: "Produk", icon: Box },
  { href: "/profit", label: "Laba", icon: ChartNoAxesCombined },
  { href: "/profile", label: "Profil", icon: UserRound }
];

export function AppShell({
  children,
  active
}: {
  children: React.ReactNode;
  active: string;
}) {
  return (
    <main className="page-shell app-backdrop">
      <section className="phone-frame app-frame">
        <div className="screen-content">{children}</div>
        <nav className="dock-nav" aria-label="Navigasi utama">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link className={active === href ? "active" : ""} href={href} key={href}>
              <Icon size={24} strokeWidth={2.15} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}

export function BackTitle({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="stack-header">
      <Link href="/dashboard" className="back-link">
        &lt; Kembali
      </Link>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
