"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { Search, Upload } from "lucide-react";
import { ProductCard } from "@/components/cards";
import { products as fallbackProducts } from "@/components/mock-data";

type ProductItem = {
  id?: number;
  name: string;
  hpp_cost: number;
  sell_price: number;
  image_path: string | null;
};

const defaultProduct = {
  name: "",
  hpp_cost: 0,
  sell_price: 0,
  image_path: "/assets/seafood.png"
};

function marginOnPrice(hpp: number, sell: number) {
  if (!sell) return 0;
  return Math.round(((sell - hpp) / sell) * 100);
}

function cleanNumericInput(event: ChangeEvent<HTMLInputElement>) {
  const normalized = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (event.target.value !== normalized) event.target.value = normalized;
  return Number(normalized || 0);
}

export function ProductManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ProductItem>(defaultProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (response.status === 401) {
        setProducts([]);
        return;
      }
      if (!response.ok) throw new Error("fallback");
      const data = await response.json();
      setProducts(data.products);
    } catch {
      setProducts(
        fallbackProducts.map(([name, hpp, price, , image], index) => ({
          id: index + 1,
          name,
          hpp_cost: Number(String(hpp).replace(/\D/g, "")),
          sell_price: Number(String(price).replace(/\D/g, "")),
          image_path: image
        }))
      );
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  async function uploadImageFile(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/upload/product-image", {
      method: "POST",
      body
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message ?? "Gagal mengunggah gambar.");
      return null;
    }
    return data.url as string;
  }

  async function onPickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage("");
    const url = await uploadImageFile(file);
    setUploading(false);
    if (url) {
      setForm((f) => ({ ...f, image_path: url }));
      setMessage("Gambar berhasil diunggah.");
    }
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const response = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editingId })
    });
    const data = await response.json();
    setMessage(data.message ?? "Produk tersimpan.");
    if (response.ok) {
      setForm(defaultProduct);
      setEditingId(null);
      setSheetOpen(false);
      await loadProducts();
    }
  }

  async function deleteProduct(id?: number) {
    if (!id) return;
    if (!window.confirm("Hapus produk ini?")) return;
    const response = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(data.message ?? "Produk dihapus.");
    if (response.ok) await loadProducts();
  }

  function openAdd() {
    setEditingId(null);
    setForm(defaultProduct);
    setSheetOpen(true);
    setMessage("");
  }

  function openEdit(p: ProductItem) {
    setEditingId(p.id ?? null);
    setForm({
      name: p.name,
      hpp_cost: p.hpp_cost,
      sell_price: p.sell_price,
      image_path: p.image_path ?? "/assets/seafood.png"
    });
    setSheetOpen(true);
    setMessage("");
  }

  const previewSrc = form.image_path ?? "/assets/seafood.png";

  return (
    <>
      <label className="search-pill">
        <Search aria-hidden size={22} strokeWidth={2} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk..." value={query} />
      </label>
      <div className="stack-list product-list">
        {visibleProducts.map((product) => {
          const marginPct = marginOnPrice(product.hpp_cost, product.sell_price);
          return (
            <ProductCard
              hpp={`Rp ${product.hpp_cost.toLocaleString("id-ID")}`}
              image={product.image_path ?? "/assets/seafood.png"}
              key={product.id ?? product.name}
              margin={marginPct ? `MARGIN ${marginPct}%` : ""}
              onDelete={() => void deleteProduct(product.id)}
              onEdit={() => openEdit(product)}
              price={`Rp ${product.sell_price.toLocaleString("id-ID")}`}
              title={product.name}
            />
          );
        })}
      </div>
      <button className="gradient-action product-fab" onClick={openAdd} type="button">
        + Tambah Produk Baru
      </button>
      {message && !sheetOpen ? <p className="form-message product-toast">{message}</p> : null}

      {sheetOpen ? (
        <div className="sheet-overlay" onClick={() => setSheetOpen(false)} role="presentation">
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="sheet-panel-head">
              <strong>{editingId ? "Edit produk" : "Produk baru"}</strong>
              <button className="sheet-close" onClick={() => setSheetOpen(false)} type="button">
                Tutup
              </button>
            </div>
            <form className="compact-data-form sheet-form" onSubmit={submitProduct}>
              <label className="field-block">
                <span>Nama produk</span>
                <input
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Nama produk"
                  value={form.name}
                />
              </label>
              <label className="field-block">
                <span>HPP</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => setForm({ ...form, hpp_cost: cleanNumericInput(event) })}
                  pattern="[0-9]*"
                  placeholder="HPP"
                  type="text"
                  value={form.hpp_cost || ""}
                />
              </label>
              <label className="field-block">
                <span>Harga jual</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => setForm({ ...form, sell_price: cleanNumericInput(event) })}
                  pattern="[0-9]*"
                  placeholder="Harga jual"
                  type="text"
                  value={form.sell_price || ""}
                />
              </label>

              <div className="field-block product-upload-block">
                <span>Gambar produk</span>
                <div className="product-upload-preview-wrap">
                  <Image
                    alt="Pratinjau"
                    className="product-upload-preview-img"
                    height={160}
                    src={previewSrc}
                    unoptimized={previewSrc.startsWith("/uploads/")}
                    width={160}
                  />
                </div>
                <label className={`product-upload-btn${uploading ? " is-busy" : ""}`}>
                  <Upload aria-hidden size={18} />
                  {uploading ? "Mengunggah…" : "Pilih gambar dari perangkat"}
                  <input
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="product-upload-native"
                    disabled={uploading}
                    key={`${editingId ?? "new"}-${sheetOpen}`}
                    onChange={(e) => void onPickImage(e)}
                    type="file"
                  />
                </label>
                <p className="product-upload-hint">JPG, PNG, WebP, atau GIF — maks. 4 MB.</p>
              </div>

              <button className="gradient-action" disabled={uploading} type="submit">
                {editingId ? "Simpan perubahan" : "Simpan produk"}
              </button>
              {message ? <p className="form-message">{message}</p> : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
