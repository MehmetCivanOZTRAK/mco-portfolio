import vinext from "vinext";
import { defineConfig } from "vite";

const cloudflareConfig = {
  name: "mco-portfolio",
  main: "./build/sites-worker.ts",
  compatibility_date: "2026-05-15",
  compatibility_flags: ["nodejs_compat"],
  routes: [
    { pattern: "mehmetcivanoztrak.com", custom_domain: true },
    { pattern: "www.mehmetcivanoztrak.com", custom_domain: true },
  ],
  d1_databases: [
    {
      binding: "DB",
      database_name: "mco-portfolio-db",
      database_id: "e312ea4c-ebbf-47c6-9360-bce02c002509",
      migrations_dir: "../../drizzle",
    },
  ],
  r2_buckets: [
    {
      binding: "BUCKET",
      bucket_name: "mco-portfolio-files",
    },
  ],
};

export default defineConfig(async () => {
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: { host: "127.0.0.1", port: 5173 },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: cloudflareConfig,
      }),
    ],
  };
});
