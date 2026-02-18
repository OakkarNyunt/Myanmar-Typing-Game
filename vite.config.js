import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path"; // 👈 ဒါလေး ထည့်ပါ

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 👈 @ ကို src folder လို့ သတ်မှတ်တာပါ
    },
  },
  plugins: [
    react(),
    VitePWA({
      // ... မင်းရဲ့ PWA config ...
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        // manifest အချက်အလက်များ
      },
    }),
  ],
  base: "./", // 👈 PWA အတွက် ဒါက အရေးကြီးပါတယ်
});
