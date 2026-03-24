import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PERFORMANCE_BUDGETS } from './src/utils/performance.utils';
import tailwindcss from "@tailwindcss/vite";

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
  plugins: [react(), performanceBudgetPlugin(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
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
  },
});
