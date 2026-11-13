import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // /api is proxied to the backend, as a reverse proxy does on the admin URL in production
  // (ADR 0020): the page and the API share an origin and the co_rt cookie stays first-party.
  const backend = env['VITE_DEV_BACKEND'] ?? 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
              },
              {
                name: 'vendor-data',
                test: /node_modules[\\/](@tanstack|axios|zod|react-hook-form|@hookform)[\\/]/,
              },
              {
                name: 'vendor-motion',
                test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              },
              { name: 'vendor-i18n', test: /node_modules[\\/](i18next|react-i18next)[\\/]/ },
            ],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        '@hookform/resolvers/zod',
        '@tanstack/react-query',
        'axios',
        'framer-motion',
        'i18next',
        'react-hook-form',
        'react-hot-toast',
        'react-i18next',
        'react-icons/ai',
        'react-icons/bi',
        'react-icons/bs',
        'react-icons/cg',
        'react-icons/ci',
        'react-icons/di',
        'react-icons/fa',
        'react-icons/fa6',
        'react-icons/fc',
        'react-icons/fi',
        'react-icons/gi',
        'react-icons/go',
        'react-icons/gr',
        'react-icons/hi',
        'react-icons/hi2',
        'react-icons/im',
        'react-icons/io',
        'react-icons/io5',
        'react-icons/lia',
        'react-icons/lu',
        'react-icons/md',
        'react-icons/pi',
        'react-icons/ri',
        'react-icons/rx',
        'react-icons/si',
        'react-icons/sl',
        'react-icons/tb',
        'react-icons/tfi',
        'react-icons/ti',
        'react-icons/vsc',
        'react-icons/wi',
        'react-router',
        'zod',
      ],
    },
    server: {
      port: 5600,
      // Each company's admin URL in development is <name>.localhost:5600 (browsers resolve
      // *.localhost to this machine); Vite refuses unknown Host headers without this.
      allowedHosts: ['.localhost'],
      proxy: { '/api': { target: backend, changeOrigin: false } },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'eslint-rules/**/*.test.js'],
      css: false,
    },
  };
});
