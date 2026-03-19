// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { workboxGenerate } from './workbox-generate';
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      pages: [
        { path: "/", prerender: { enabled: true } },
        { path: "/about", prerender: { enabled: true } },
        { path: "/privacy", prerender: { enabled: true } },
        { path: "/terms", prerender: { enabled: true } },
      ],
    }),

    netlify(),
    {
      "name": "workbox",
      applyToEnvironment(environment) {
        return environment.name === "ssr";
      },
      buildStart: () => workboxGenerate(),
    },
    // VitePWA({
    //   registerType: "autoUpdate",
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg,js,json}"],
    //   },
    //   manifest: {
    //     name: "FinFlow",
    //     short_name: "FinFlow",
    //     description: "A personal finance management app",
    //     start_url: "/dashboard/home",
    //     display: "standalone",
    //     display_override: ["window-controls-overlay"],
    //     orientation: "portrait-primary",
    //     theme_color: "#4F46E5",
    //     background_color: "#4F46E5",
    //     launch_handler: {
    //       client_mode: "navigate-new"
    //     },
    //     icons: [
    //       {
    //         src: "pwa-64x64.png",
    //         sizes: "64x64",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any",
    //       },
    //       {
    //         src: "maskable-icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "maskable",
    //       },
    //     ],
    //     screenshots: [
    //       {
    //         src: "mobile.png",
    //         sizes: "390x844",
    //         type: "image/png",
    //         form_factor: "narrow",
    //         label: "FinFlow Mobile View"
    //       },
    //       {
    //         src: "desktop.png",
    //         sizes: "1280x720",
    //         type: "image/png",
    //         form_factor: "wide",
    //         label: "FinFlow Desktop View"
    //       }
    //     ],
    //   },
    //   devOptions: {
    //     enabled: true,
    //   }
    // }),
    react(),
    tailwindcss(),
  ],
});
