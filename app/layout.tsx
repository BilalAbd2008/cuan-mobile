import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./globals.css";

/** Hindari prerender bermasalah di beberapa host; Vercel tetap cache per request. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cuanin",
  description: "Aplikasi web mobile-first untuk HPP, arus kas, dan laba usaha."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
