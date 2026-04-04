import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

// Unregister stale service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

const rootElement = document.getElementById("root")!;
const app = (
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
);

if (rootElement.querySelector('[data-prerendered="course-seo"]')) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
