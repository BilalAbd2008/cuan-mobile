import { Suspense } from "react";
import { AppShell, BackTitle } from "@/components/mobile-shell";
import { HppResultInner } from "@/components/hpp-result-inner";

export const dynamic = "force-dynamic";

export default function HppResultPage() {
  return (
    <AppShell active="/hpp">
      <BackTitle subtitle="Ringkasan perhitungan tersimpan" title="Hasil HPP" />
      <Suspense fallback={<p className="form-message">Memuat…</p>}>
        <HppResultInner />
      </Suspense>
    </AppShell>
  );
}

