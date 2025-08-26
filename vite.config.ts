import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona requisições de /api para o seu backend Express
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true, // Necessário para evitar erros de CORS
      }
    }
  }
})