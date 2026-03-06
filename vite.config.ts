import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Apenas desenvolvimento; build de produção não usa dev server nem WebSocket (evita referências a localhost:8081)
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
