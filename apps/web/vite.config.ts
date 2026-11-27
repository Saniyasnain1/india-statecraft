import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@india-statecraft/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@india-statecraft/game-data': path.resolve(__dirname, '../../packages/game-data/src/index.ts'),
      '@india-statecraft/map-data': path.resolve(__dirname, '../../packages/map-data/src/index.ts'),
      '@india-statecraft/simulation': path.resolve(__dirname, '../../packages/simulation/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split MapLibre into its own vendor chunk — it's large by design
          'vendor-maplibre': ['maplibre-gl'],
          // Split React into its own vendor chunk
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
});
