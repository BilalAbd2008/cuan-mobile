import mysql from "mysql2/promise";

const globalForMysql = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getPool() {
  if (!globalForMysql.mysqlPool) {
    const useSsl =
      process.env.MYSQL_SSL === "true" ||
      process.env.MYSQL_SSL_MODE === "required" ||
      process.env.MYSQL_SSL_MODE === "REQUIRED";

    const ssl =
      useSsl
        ? {
            ca: process.env.MYSQL_SSL_CA?.replace(/\\n/g, "\n"),
            rejectUnauthorized:
              process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "false" ? false : true
          }
        : undefined;

    globalForMysql.mysqlPool = mysql.createPool({
      host: requiredEnv("MYSQL_HOST"),
      port: Number(process.env.MYSQL_PORT ?? 3306),
      database: requiredEnv("MYSQL_DATABASE"),
      user: requiredEnv("MYSQL_USER"),
      password: process.env.MYSQL_PASSWORD ?? "",
      ssl,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }

  return globalForMysql.mysqlPool;
}

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  product_id: number | null;
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  quantity: number | null;
  transaction_date: string;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  hpp_cost: number;
  sell_price: number;
  image_path: string | null;
  created_at: string;
};
