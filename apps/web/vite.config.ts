import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const texte = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../data/texte/de.json'), 'utf8')) as Record<string, string>;

const base = process.env.BASE_PATH ?? '/';
const demo = (process.env.VITE_MODE ?? 'demo') !== 'live';

export default defineConfig({
  base,
  define: { __DEMO__: JSON.stringify(demo) },
  resolve: { alias: { '@data': resolve(import.meta.dirname, '../../data') } },
  build: { outDir: process.env.OUT_DIR ?? 'dist', emptyOutDir: true },
  plugins: [
    react(),
    { name: 'app-titel', transformIndexHtml: (html: string) => html.replace('%APP_TITEL%', texte['app.titel'] ?? '') },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: texte['pwa.name'],
        short_name: texte['pwa.kurzname'],
        description: texte['pwa.beschreibung'],
        lang: texte['app.sprache'],
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f4efe6',
        theme_color: '#2f6f73',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,woff2,svg,png}'], navigateFallback: `${base}index.html` },
    }),
  ],
});
