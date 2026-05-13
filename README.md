# Cuan Mobile Web

Starter website mobile-first berbasis Next.js App Router dengan contoh koneksi MySQL untuk Laragon.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Buat database kosong bernama sesuai `MYSQL_DATABASE`, lalu sesuaikan kredensial MySQL lokal.
3. Jalankan `npm run db:init` untuk membuat tabel, seed data awal, dan tabel `users`.
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

## Deploy gratis ke Vercel + Aiven MySQL

Vercel tidak bisa memakai MySQL Laragon lokal dari internet. Untuk opsi gratis yang sesuai dengan stack proyek ini, gunakan Aiven for MySQL Free Tier.

1. Buat service `MySQL` free tier di Aiven.
2. Di Aiven, buat database aplikasi, misalnya `cuan_app`, atau gunakan database bawaan provider.
3. Salin detail koneksi dari halaman service Aiven:
   - host
   - port
   - database
   - username
   - password
4. Isi `.env.local` dengan nilai tersebut, lalu set:
   - `MYSQL_SSL=true`
   - `JWT_SECRET` berupa string acak panjang
5. Jika provider meminta CA certificate, isi `MYSQL_SSL_CA` dengan isi PEM sebagai satu baris menggunakan `\n`.
6. Jalankan dari lokal:

```bash
npm run db:init
npm run db:test
```

7. Di Vercel Project Settings > Environment Variables, set nilai yang sama untuk `Production`:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_SSL=true`
   - `MYSQL_SSL_CA` bila diperlukan
   - `JWT_SECRET`
8. Redeploy deployment production setelah environment variable ditambahkan.

Endpoint `/api/health` membantu memastikan `JWT_SECRET` dan konfigurasi MySQL inti sudah terbaca server.

## Catatan desain

Implementasi saat ini adalah fondasi mobile-first yang siap diarahkan ke desain final. Untuk menyamakan tampilan persis dengan Canva, gunakan screenshot atau export tiap layar sebagai acuan visual.
