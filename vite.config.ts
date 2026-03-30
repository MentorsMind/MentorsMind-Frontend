import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { PERFORMANCE_BUDGETS } from './src/utils/performance.utils';

const performanceBudgetPlugin = (): Plugin => ({
  name: 'performance-budget-plugin',
  generateBundle(_, bundle) {
    Object.entries(bundle).forEach(([fileName, output]) => {
      if (output.type !== 'chunk') return;
      const sizeKb = Buffer.byteLength(output.code, 'utf8') / 1024;
      if (sizeKb > PERFORMANCE_BUDGETS.maxChunkKb) {
        this.warn(
          `Chunk ${fileName} is ${sizeKb.toFixed(1)}KB, exceeding the ${PERFORMANCE_BUDGETS.maxChunkKb}KB budget.`
        );
      }
    });
  },
});

export default defineConfig({
<<<<<<< HEAD
  plugins: [
    react(),
    performanceBudgetPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'MentorsMind',
        short_name: 'MentorsMind',
        description: 'Mentorship platform',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache',
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
            },
          },
        ],
      },
    }),
  ],
=======
  plugins: [react(), performanceBudgetPlugin()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
>>>>>>> main
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    sourcemap: false,
    treeshake: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-router') || id.includes('@remix-run/router')) return 'router';
            return 'vendor';
          }

          if (id.includes('/src/pages/')) return 'pages';
          if (id.includes('/src/components/learner/')) return 'learner-suite';
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: PERFORMANCE_BUDGETS.maxChunkKb,
    minify: 'esbuild',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    polyfillModulePreload: true,
  },
});