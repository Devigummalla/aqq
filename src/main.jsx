import 'regenerator-runtime/runtime'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Create root only once and store it in a variable
const rootElement = document.getElementById('root');

// Check if we already have a root instance attached to this element
if (!rootElement._reactRootContainer) {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
