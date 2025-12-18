import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Adicionar tratamento de erro global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Erro ao carregar o aplicativo</h1>
      <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      <p>Verifique o console para mais detalhes.</p>
    </div>
  `;
}
