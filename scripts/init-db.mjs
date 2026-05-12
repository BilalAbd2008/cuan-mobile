import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const schemaSql = fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8");
const migrationUsers = path.join(root, "database", "migration-users.sql");

const c = await mysql.createConnection({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD || "",
  multipleStatements: true
});

try {
  await c.query(schemaSql);
  console.log("Schema database/schema.sql berhasil dijalankan.");
  if (fs.existsSync(migrationUsers)) {
    await c.query(fs.readFileSync(migrationUsers, "utf8"));
    console.log("Migrasi database/migration-users.sql berhasil dijalankan.");
  }
} finally {
  await c.end();
}
