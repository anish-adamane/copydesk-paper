import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sql.js"],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
