import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./pages/App";
import { BrowserRouter } from "react-router";
import { ModalProvider } from "./components/my-own-modal-handler";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ModalProvider>
  </StrictMode>
);
