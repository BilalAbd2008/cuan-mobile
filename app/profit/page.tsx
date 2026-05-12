import { AppShell, BackTitle } from "@/components/mobile-shell";
import { ProfitSummary } from "@/components/profit-summary";

export default function ProfitPage() {
  return (
    <AppShell active="/profit">
      <BackTitle subtitle="Performa usahamu bulan ini" title="Laporan Laba" />
      <ProfitSummary />
    </AppShell>
  );
}
