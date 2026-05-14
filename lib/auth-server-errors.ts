/**
 * Pesan untuk pengguna saat login/daftar gagal karena DB atau env (khususnya di Vercel vs Laragon lokal).
 */
export function describeAuthServerError(error: unknown, fallback: string): string {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : "";

  if (msg.includes("Missing environment variable")) {
    if (msg.includes("JWT_SECRET")) {
      return "JWT_SECRET belum diatur. Di Vercel: Project → Settings → Environment Variables → tambahkan JWT_SECRET (min. 16 karakter) untuk Production.";
    }
    return "Variabel MySQL belum lengkap di server. Di Vercel set: MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD (jika ada).";
  }

  if (msg.includes("JWT_SECRET harus diisi")) {
    return "JWT_SECRET belum diatur atau terlalu pendek. Set di Vercel Environment Variables (Production), minimal 16 karakter.";
  }

  if (
    code === "ENOTFOUND" ||
    /ENOTFOUND|getaddrinfo/i.test(msg)
  ) {
    return "Host MySQL tidak ditemukan. Cek MYSQL_HOST di Vercel Environment Variables dan pastikan nilainya persis sama dengan host dari Aiven (tanpa https://, tanpa port, tanpa spasi). Setelah diubah, redeploy.";
  }

  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    /ECONNREFUSED|ETIMEDOUT/i.test(msg)
  ) {
    return "Tidak bisa menghubungi MySQL. Pastikan MYSQL_HOST, MYSQL_PORT, SSL Aiven, dan kredensial di Vercel Production sudah benar. Jika memakai Aiven, gunakan host dan port dari halaman service Aiven lalu redeploy.";
  }

  if (code === "ER_ACCESS_DENIED_ERROR" || msg.includes("Access denied")) {
    return "MySQL menolak koneksi — periksa MYSQL_USER dan MYSQL_PASSWORD di Vercel.";
  }

  if (code === "ER_BAD_DB_ERROR" || msg.includes("Unknown database")) {
    return "Database tidak ditemukan — periksa MYSQL_DATABASE (nama DB harus sudah dibuat di server MySQL).";
  }

  if (code === "ER_NO_SUCH_TABLE" || msg.includes("doesn't exist")) {
    return "Tabel belum ada — impor schema SQL (termasuk tabel users) ke database di hosting.";
  }

  return fallback;
}
