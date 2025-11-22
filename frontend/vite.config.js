import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// use environment variable for backend API URL, fallback to localhost for dev
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      }
    }
  }
})

