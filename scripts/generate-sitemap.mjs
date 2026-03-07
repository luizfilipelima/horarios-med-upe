#!/usr/bin/env node
/**
 * Gera public/sitemap.xml com a URL base do site (VITE_SITE_URL).
 * Executado no build para garantir URLs absolutas corretas.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let base = process.env.VITE_SITE_URL || '';
if (!base) {
  try {
    const env = readFileSync(join(root, '.env'), 'utf8');
    const m = env.match(/VITE_SITE_URL=(.+)/m);
    if (m) base = m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
}
if (!base) base = 'https://gradly.app';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log('✓ sitemap.xml gerado em public/ (base:', base, ')');
