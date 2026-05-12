import { AppShell, BackTitle } from "@/components/mobile-shell";
import { ProductManager } from "@/components/product-manager";

export default function ProductsPage() {
  return (
    <AppShell active="/products">
      <BackTitle subtitle="Kelola produk hasil HPP-mu" title="Daftar Produk" />
      <ProductManager />
    </AppShell>
  );
}
