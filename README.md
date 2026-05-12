# Cuan Mobile Web

Starter website mobile-first berbasis Next.js App Router dengan contoh koneksi MySQL untuk Laragon.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Sesuaikan kredensial MySQL Laragon.
3. Import [database/schema.sql](database/schema.sql) lewat phpMyAdmin atau MySQL client Laragon.
   Schema ini sekarang mencakup `products`, `transactions`, dan `hpp_calculations`.
4. Jalankan:

```bash
npm install
npm run dev
```

5. Buka `http://localhost:3000`.

## Struktur penting

- `app/page.tsx`: splash screen awal aplikasi.
- `app/api/transactions/route.ts`: endpoint GET/POST transaksi.
- `app/api/products/route.ts`: CRUD produk.
- `app/api/hpp/route.ts`: simpan hasil perhitungan HPP.
- `app/api/profit/route.ts`: ringkasan laba otomatis dari transaksi + produk.
- `lib/db.ts`: pool koneksi MySQL.
- `database/schema.sql`: schema dan seed data awal.

## Route desain

- `/`: splash screen
- `/login`: login
- `/register`: registrasi
- `/dashboard`: beranda
- `/hpp`: kalkulator HPP
- `/hpp/result`: hasil perhitungan HPP
- `/finance`: laporan keuangan
- `/products`: daftar produk
- `/profit`: laporan laba
- `/profile`: profil usaha

## Fitur data

- Produk: tambah, edit, hapus.
- Transaksi: input pemasukan/pengeluaran dan hapus transaksi.
- HPP: hitung HPP per porsi, ubah margin, simpan hasil.
- Laporan laba: otomatis menjumlah omzet, total HPP, pengeluaran, dan laba bersih.

Jika koneksi database belum aktif, beberapa layar masih menampilkan fallback mock agar UI tetap bisa dipreview.

## Deploy ke Vercel

Vercel tidak bisa memakai MySQL Laragon lokal dari internet. Untuk produksi, gunakan database MySQL yang dapat diakses publik atau layanan database terkelola, lalu isi environment variable berikut di dashboard Vercel:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

## Catatan desain

Implementasi saat ini adalah fondasi mobile-first yang siap diarahkan ke desain final. Untuk menyamakan tampilan persis dengan Canva, gunakan screenshot atau export tiap layar sebagai acuan visual.
