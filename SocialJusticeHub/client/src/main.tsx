import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

// Set the document title
document.title = "¡BASTA! - El cambio empieza en vos";

// Add meta tags
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Una plataforma de participación ciudadana para transformar Argentina a través de acciones colectivas e individuales.';
document.head.appendChild(metaDescription);

// Add font links
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap';
document.head.appendChild(fontLink);

// Add favicon
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>¡</text></svg>';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
);
