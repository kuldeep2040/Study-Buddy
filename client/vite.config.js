import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Makes the app installable on a phone ("Add to Home Screen").
    VitePWA({
      registerType: 'autoUpdate', // new versions install themselves on next visit
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Study Buddy',
        short_name: 'Study Buddy',
        description: 'Track your study time, stay focused, and keep improving.',
        theme_color: '#12756a',
        background_color: '#f5f3ee',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The service worker must NEVER answer /api calls with the cached app page.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    port: 5173,
    // Dev proxy: the browser calls http://localhost:5173/api/... and Vite forwards it to the
    // Express server. To the browser it's all ONE site, so cookies just work.
    proxy: {
      // API_PROXY_TARGET (optional, a terminal variable — not VITE_*) lets tests point at another server.
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:5000',
    },
  },
});
