import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@fortawesome/fontawesome-free/css/all.min.css";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

reportWebVitals();
