// Entry point: mounts the React app into <div id="root"> in index.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import { initTheme } from './utils/theme.js';

initTheme(); // light/dark (and keep following the phone's setting while on "Auto")

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables page navigation (/, /login, /supporter…) without full reloads */}
    <BrowserRouter>
      {/* AuthProvider makes "who is logged in" available to every page */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
