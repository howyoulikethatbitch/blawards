import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { seedDatabase } from "./db";
import "./styles.css";

seedDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" theme="dark" richColors />
      </BrowserRouter>
    </StrictMode>,
  );
});