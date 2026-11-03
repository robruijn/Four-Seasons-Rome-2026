import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// Keuzes:
// - base './': de app werkt in elke (sub)map, bijv. https://<naam>.github.io/<repo>/
// - vite-plugin-pwa met precache van app, programma.json, foto's en lettertype:
//   na één keer laden werkt alles offline behalve Google-kaart en Street View.
// - Google-verzoeken worden bewust NIET gecachet (voorwaarden Google Maps Platform).
export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Rome met de groep',
        short_name: 'Rome',
        description: 'Programma, adressen en wandelroutes voor de groepsreis naar Rome, 13 t/m 15 november 2026.',
        lang: 'nl',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f5efe4',
        theme_color: '#a8462a',
        categories: ['travel'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        globIgnores: ['**/node_modules/**'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Weerbericht: netwerk eerst, anders het laatst bekende bericht
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'weer', networkTimeoutSeconds: 5, expiration: { maxEntries: 4, maxAgeSeconds: 3 * 86400 } }
          }
        ]
      }
    })
  ],
  build: { target: 'es2020', cssCodeSplit: false }
});
