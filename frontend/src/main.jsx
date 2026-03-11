import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element "#root" not found');
}

createRoot(rootElement).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
