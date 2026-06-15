import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BACKEND_URL is a plain Node env var readable by vite.config.ts at dev-server startup.
// VITE_API_URL is only injected into the browser bundle via import.meta.env — not here.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/chat': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
