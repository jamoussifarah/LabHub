import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

import App from "./App";
import { AppWrapper } from "./components/common/PageMeta";
import { ThemeProvider } from "./context/ThemeContext";

// 🔹 Log pour vérifier que le script est exécuté
console.log("🟢 index.tsx chargé");

// Optionnel : un petit composant pour log la montée de l'arbre
const RootLogger = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("🚀 RootLogger monté !");
  }, []);
  return <>{children}</>;
};

// 🔹 Création du root
const root = createRoot(document.getElementById("root")!);
console.log("🔹 Root React créé");

root.render(
  <StrictMode>
    <RootLogger>
      <ThemeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProvider>
    </RootLogger>
  </StrictMode>
);

console.log("🔹 App render appelée");