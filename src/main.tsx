import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadAll } from "./lib/store";
import "./styles.css";

void loadAll();
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
