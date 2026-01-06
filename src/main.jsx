// [Layout] 앱 진입점 - React 앱을 DOM에 마운트
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/Global.css";
import App from "./App.jsx";

// [Logic] React 18 createRoot API 사용
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
