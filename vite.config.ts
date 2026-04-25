import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Banco-Personal/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
