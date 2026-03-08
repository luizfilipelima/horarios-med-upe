import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITE_URL = process.env.VITE_SITE_URL || ''

const baseManifest = {
  name: 'Gradly',
  short_name: 'Gradly',
  description: 'Horários para alunos, delegados e administradores.',
  display: 'standalone',
  background_color: '#09090b',
  theme_color: '#09090b',
  orientation: 'portrait-primary',
  scope: '/',
  start_url: '/',
  icons: [
    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}

function getStartUrl(url: string, referer?: string): string {
  try {
    const u = new URL(url, 'http://localhost')
    const q = u.searchParams.get('start_url')
    if (q && (q.startsWith('/t/') || q === '/' || q.startsWith('/login'))) return q
  } catch {}
  if (referer) {
    try {
      const r = new URL(referer)
      const p = (r.pathname || '/') + (r.search || '')
      if (p.startsWith('/t/') || p === '/' || p.startsWith('/login')) return p
    } catch {}
  }
  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-inject-env',
      transformIndexHtml(html) {
        return html.replace(/\{\{SITE_URL\}\}/g, SITE_URL)
      },
    },
    {
      name: 'manifest-api',
      configureServer(server) {
        server.middlewares.use('/api/manifest', (req, res) => {
          const referer = req.headers.referer || req.headers.referrer
          const startUrl = getStartUrl(req.url || '/', typeof referer === 'string' ? referer : undefined)
          const manifest = { ...baseManifest, start_url: startUrl }
          res.setHeader('Content-Type', 'application/manifest+json')
          res.setHeader('Cache-Control', 'public, max-age=0')
          res.end(JSON.stringify(manifest))
        })
      },
    },
  ],
  server: {
    port: 5173,
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
