// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const allowedHosts =
  process.env.VITE_ALLOWED_HOSTS?.split(",").map((host) => host.trim()) ?? [
    "stylehorizon.onrender.com",
  ];

export default defineConfig({
  vite: {
    server: {
      allowedHosts,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
