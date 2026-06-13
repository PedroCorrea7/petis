import "./styles.css";
import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<StartClient />);
