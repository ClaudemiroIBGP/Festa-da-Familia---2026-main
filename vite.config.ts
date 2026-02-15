import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ajuste se mudar o nome do repositório
const repo = 'Festa-da-Familia---2026-main'

export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`,
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
})
