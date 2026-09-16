import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sql.js"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
