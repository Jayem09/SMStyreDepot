
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./app/App.tsx";
import "./styles/fonts.css";
import "./styles/tailwind.css";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
