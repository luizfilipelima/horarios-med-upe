/**
 * Manifest dinâmico para PWA.
 * Usa o Referer para definir start_url = página atual (turma + grupo),
 * garantindo que o atalho na tela inicial abra a turma e o grupo corretos.
 */
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
};

function getStartUrlFromReferer(referer) {
  if (!referer || typeof referer !== 'string') return '/';
  try {
    const url = new URL(referer);
    const path = url.pathname || '/';
    const search = url.search || '';
    const start = path + search;
    // Garantir que é uma rota válida da nossa SPA
    if (start.startsWith('/t/') || start === '/' || start.startsWith('/login')) {
      return start;
    }
    return '/';
  } catch {
    return '/';
  }
}

function getStartUrl(req) {
  try {
    const url = new URL(req.url || req.originalUrl || '/', 'https://example.com');
    const s = url.searchParams.get('start_url');
    if (s && typeof s === 'string') {
      const t = s.trim();
      if (t.startsWith('/t/') || t === '/' || t.startsWith('/login')) return t;
    }
  } catch (_) {}
  const q = req?.query || {};
  if (q.start_url && typeof q.start_url === 'string') {
    const s = q.start_url.trim();
    if (s.startsWith('/t/') || s === '/' || s.startsWith('/login')) return s;
  }
  const referer = req?.headers?.referer || req?.headers?.referrer;
  return getStartUrlFromReferer(referer);
}

export default function handler(req, res) {
  const startUrl = getStartUrl(req);
  const manifest = { ...baseManifest, start_url: startUrl };
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
  res.status(200).json(manifest);
}
