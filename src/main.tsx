import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { seedDatabase } from "./db";
import "./styles.css";

const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

seedDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Router>
        <App />
        <Toaster position="bottom-right" theme="dark" richColors />
      </Router>
    </StrictMode>,
  );
});