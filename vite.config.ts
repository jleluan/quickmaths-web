import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite configuration for QuickMaths Web
// The base option is set relative so the game can be hosted from any path.
export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: true,
  },
});
