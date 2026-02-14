import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const repoName = 'Festa-da-Familia---2026-main';
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    base: isProd ? `/${repoName}/` : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // ...o resto do seu config (se tiver)
  };
});
