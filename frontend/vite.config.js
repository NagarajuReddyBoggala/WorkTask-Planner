import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Load env file based on current mode (development, production)
  const env = loadEnv(mode, process.cwd())

  const backendUrl = 'https://worktask-planner.onrender.com'

  return defineConfig({
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  })
}

