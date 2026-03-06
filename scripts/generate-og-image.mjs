#!/usr/bin/env node
/**
 * Gera public/og-image.png a partir de scripts/og-image.svg
 * O logo Gradly (gradly.svg) está embutido no template para manter consistência.
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'scripts', 'og-image.svg')
const pngPath = join(root, 'public', 'og-image.png')

const svg = readFileSync(svgPath)

await sharp(svg)
  .resize(1200, 630)
  .png()
  .toFile(pngPath)

console.log('✓ og-image.png gerado em public/')
