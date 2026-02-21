import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react";

// PWA Service Worker ကို register လုပ်ခြင်း
import { registerSW } from "virtual:pwa-register";

// ဒါက App ကို run တာနဲ့ PWA ကို နောက်ကွယ်ကနေ အဆင်သင့်ဖြစ်အောင် လုပ်ပေးတာပါ
// Render ရဲ့ အပြင်ဘက်မှာ သီးသန့် ထားပေးရပါမယ်
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
