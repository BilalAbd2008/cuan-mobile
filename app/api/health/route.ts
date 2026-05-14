import { NextResponse } from "next/server";
import dns from "node:dns/promises";

/** Cek deployment + keberadaan env penting (tanpa mengekspos nilai rahasia). */
function maskHost(host?: string) {
  if (!host) return "";
  if (host.length <= 10) return host;
  return `${host.slice(0, 18)}...${host.slice(-18)}`;
}

export async function GET() {
  const hasJwt = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16);
  const mysqlHost = process.env.MYSQL_HOST?.trim();
  const hasMysqlCore = Boolean(
    mysqlHost && process.env.MYSQL_DATABASE && process.env.MYSQL_USER
  );
  let mysqlDns: "not_configured" | "ok" | "failed" = mysqlHost ? "failed" : "not_configured";

  if (mysqlHost) {
    try {
      await dns.lookup(mysqlHost);
      mysqlDns = "ok";
    } catch {
      mysqlDns = "failed";
    }
  }

  return NextResponse.json({
    ok: true,
    service: "cuan-mobile",
    env: {
      jwt_secret_configured: hasJwt,
      mysql_core_configured: hasMysqlCore,
      mysql_host: maskHost(mysqlHost),
      mysql_host_has_protocol: Boolean(mysqlHost?.includes("://")),
      mysql_host_has_port: Boolean(mysqlHost?.includes(":")),
      mysql_dns: mysqlDns,
      mysql_port: process.env.MYSQL_PORT ?? ""
    }
  });
}
