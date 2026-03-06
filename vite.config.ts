import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server aplica-se apenas a `vite dev`; build de produção não inclui HMR nem WebSocket
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
