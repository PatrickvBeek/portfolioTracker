import "@fortawesome/fontawesome-free/css/all.min.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

reportWebVitals();
