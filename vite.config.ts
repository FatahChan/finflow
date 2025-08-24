// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReactOxc from "@vitejs/plugin-react-oxc";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      customViteReactPlugin: true,
      target: "vercel",
      spa: {
        enabled: true,
      },
      pages:[
        {
          path: "/",
          prerender: {
            enabled: true,
            outputPath: "index.html",
          },
        },
        {
          path: "/about",
          prerender: {
            enabled: true,
            outputPath: "about.html",
          },
        },
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
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,js}"],
      },
      manifest: {
        name: "FinFlow",
        short_name: "FinFlow",
        description: "A personal finance management app",
        start_url: "/dashboard/home",
        theme_color: "#4F46E5",
        background_color: "#4F46E5",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    viteReactOxc(),
    tailwindcss(),
  ],
});
