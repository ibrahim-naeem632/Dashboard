import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const dashboard = document.getElementById("dashboard");

if (!dashboard) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(dashboard).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);