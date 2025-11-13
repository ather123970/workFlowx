import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import TestApp from "./TestApp.tsx";
import "./index.css";

// Add error handling for debugging
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  
  // Try to render the main app, fall back to test app if it fails
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Main app rendered successfully");
  } catch (appError) {
    console.error("Main app failed, trying test app:", appError);
    root.render(
      <React.StrictMode>
        <TestApp />
      </React.StrictMode>
    );
    console.log("Test app rendered successfully");
  }
} catch (error) {
  console.error("Failed to render any app:", error);
  // Fallback rendering
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>WorkFlowX - Loading Error</h1>
      <p>There was an error loading the application. Please check the console for details.</p>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}
