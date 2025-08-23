// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReactOxc from "@vitejs/plugin-react-oxc";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      customViteReactPlugin: true,
      target: "netlify",
      spa: {
        enabled: true,
      },
      pages:[
        {
          path: "/privacy",
          prerender: {
            enabled: true,
            outputPath: "privacy.html",
          },
        },
        {
          path: "/terms",
          prerender: {
            enabled: true,
            outputPath: "terms.html",
          },
        },
      ]
    }),
    viteReactOxc(),
    tailwindcss(),
  ],
});
