import { AppShell, BackTitle } from "@/components/mobile-shell";
import { HppCalculator } from "@/components/hpp-calculator";

export default function HppPage() {
  return (
    <AppShell active="/hpp">
      <BackTitle
        subtitle="Hitung Harga Pokok Produksi & Rekomendasi Harga Jual"
        title="Kalkulator HPP"
      />
      <HppCalculator />
    </AppShell>
  );
}
