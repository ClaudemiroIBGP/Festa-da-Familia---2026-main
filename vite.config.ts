import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Festa-da-Familia---2026-main/', 
});
