import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/app.svg', 'favicon.svg'],
      manifest: {
        name: '圣言',
        short_name: '圣言',
        description: '圣经阅读与团契',
        theme_color: '#4338ca',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        icons: [
          { src: '/icons/app.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/app.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/bible'),
            handler: 'CacheFirst',
            options: { cacheName: 'bible-verses', expiration: { maxEntries: 2000 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      'libsodium-wrappers': path.resolve(process.cwd(), 'node_modules/libsodium-wrappers/dist/modules/libsodium-wrappers.js')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true }
    }
  }
})
