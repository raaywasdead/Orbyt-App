import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker is auto-generated; updates silently in background
      devOptions: {
        enabled: false, // enable only in production builds to avoid dev issues
      },
      includeAssets: ['Logo-Orbyt.svg', 'logo.png'],
      manifest: {
        name: 'Orbyt — Sua órbita produtiva',
        short_name: 'Orbyt',
        description: 'Gerenciador de tarefas com prioridades, conquistas e temas personalizáveis.',
        theme_color: '#0d0d14',
        background_color: '#0d0d14',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/app',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/Logo-Orbyt.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        screenshots: [],
        categories: ['productivity', 'utilities'],
      },
      workbox: {
        // Cache all app assets on first load
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Network-first for navigation (always try to get fresh HTML)
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost(:\d+)?\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  server: {
    allowedHosts: [
      'unfined-hattie-unattributively.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ]
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@dnd-kit')) return 'dnd-kit'
          if (id.includes('@tsparticles')) return 'tsparticles'
          if (id.includes('lucide-react')) return 'lucide'
          if (id.includes('framer-motion')) return 'framer-motion'
          if (id.includes('react-icons')) return 'react-icons'
          if (id.includes('react-dom')) return 'react-vendor'
          if (id.includes('/react/')) return 'react-vendor'
          if (id.includes('react-router')) return 'react-vendor'  
          if (id.includes('scheduler')) return 'react-vendor'     
          return 'vendor'
        },
      },
    },
  },
})
