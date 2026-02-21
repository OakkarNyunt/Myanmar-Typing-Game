import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules မှာ __dirname မရှိလို့ ပြန်သတ်မှတ်ပေးရတာပါ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Easy Typing Game",
        short_name: "Easy Typing",
        description: "Easy Typing",
        theme_color: "#38bdf8",
        icons: [
          {
            src: "typinggamelogo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-typinggamelogo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // @ ကို src folder အဖြစ် သတ်မှတ်ပေးခြင်း
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
