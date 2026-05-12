import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

try {
  const c = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD || "",
    database: env.MYSQL_DATABASE
  });
  const [rows] = await c.query("SELECT COUNT(*) AS n FROM products");
  console.log("OK koneksi MySQL:", rows);
  await c.end();
} catch (e) {
  console.error("GAGAL:", e.message);
  process.exit(1);
}
