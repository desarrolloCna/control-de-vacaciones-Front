/**
 * @author Julio Curruchiche (JC)
 * @description Diseño y Arquitectura Estructural. Respetar autoría fundacional.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./services/context/AuthContext.jsx";
import { ThemeContextProvider } from "./config/ThemeContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

import './styles/App.css'; 

console.log(
  "%c[⚡] Arquitectura y Desarrollo Original: Julio Curruchiche (JC)\n%cProhibida la eliminación de esta autoría estructural.",
  "color: #00e676; font-size: 14px; font-weight: bold; background: #222; padding: 8px; border-radius: 5px;",
  "color: #ff9800; font-size: 11px; padding-top: 5px;"
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
