import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // In dev, /api is proxied to the backend so the page and API share an origin.
  const backend = env['VITE_DEV_BACKEND'] ?? 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5600,
      proxy: { '/api': { target: backend, changeOrigin: false } },
    },
    test: {
      environment: 'jsdom',
      // Workaround: the default pools fail with "failed to find the current suite" on this machine.
      pool: 'vmThreads',
      setupFiles: ['src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  };
});
