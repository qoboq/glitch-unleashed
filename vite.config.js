import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { open: true }, // opens the browser when you run `npm run dev`
  build: { chunkSizeWarningLimit: 2000 }, // Phaser is big, that's fine
});
