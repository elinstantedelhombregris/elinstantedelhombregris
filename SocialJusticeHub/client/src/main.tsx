import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

// Unregister stale service workers — except the Radar PWA's (scope /radar)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => {
      if (!new URL(r.scope).pathname.startsWith('/radar')) r.unregister();
    });
  });
  if (window.location.pathname.startsWith('/radar')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/radar-sw.js', { scope: '/radar' }).catch(() => {});
    });
  }
}

const rootElement = document.getElementById("root")!;
const app = (
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
);

if (rootElement.querySelector("[data-prerendered]")) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
