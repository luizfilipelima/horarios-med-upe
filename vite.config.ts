import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITE_URL = process.env.VITE_SITE_URL || ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-inject-site-url',
      transformIndexHtml(html) {
        return html.replace(/\{\{SITE_URL\}\}/g, SITE_URL)
      },
    },
  ],
  // server aplica-se apenas a `vite dev`; build de produção não inclui HMR nem WebSocket
  server: {
    port: 5173,
    proxy: {
      '/api/manifest': {
        target: 'http://localhost:5173',
        rewrite: () => '/manifest.json',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
