import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/football-pa-caller/', // GitHub Pages subpath
  test: {
    globals: true,
    environment: 'node',
  },
} as any);
