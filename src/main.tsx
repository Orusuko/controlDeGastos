import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { initNativeShell } from "./lib/native";
import "./index.css";

void initNativeShell();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
