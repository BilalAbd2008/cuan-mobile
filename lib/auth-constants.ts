/**
 * Nama cookie sesi — dipakai API route lewat `lib/session.ts` (ekspor `COOKIE`).
 * Middleware Edge (`middleware.ts`) tidak boleh mengimpor file proyek; di sana nilai
 * yang sama di-hardcode sebagai `SESSION_COOKIE_NAME` — ubah keduanya bersamaan.
 */
export const SESSION_COOKIE = "cuan_token";
