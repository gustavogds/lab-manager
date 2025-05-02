import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./pages/App";
import { BrowserRouter } from "react-router";
import { ModalProvider } from "./components/my-own-modal-handler";
import { GlobalDataProvider } from "helpers/context/globalContext";

createRoot(document.getElementById("root")!).render(
  <GlobalDataProvider>
    <ModalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ModalProvider>
  </GlobalDataProvider>
);
