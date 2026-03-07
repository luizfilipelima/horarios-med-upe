#!/usr/bin/env node
/** Gera ícones PWA (192x192 e 512x512) a partir do favicon.svg */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'favicon.svg')
const svg = readFileSync(svgPath)

await Promise.all([
  sharp(svg).resize(192, 192).png().toFile(join(root, 'public', 'icon-192x192.png')),
  sharp(svg).resize(512, 512).png().toFile(join(root, 'public', 'icon-512x512.png')),
])

console.log('✓ icon-192x192.png e icon-512x512.png gerados em public/')
