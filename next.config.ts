import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sql.js"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/sql.js/dist/sql-wasm.wasm"],
  },
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.trycloudflare.com"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vercel.app"],
    },
  },
};

export default nextConfig;
