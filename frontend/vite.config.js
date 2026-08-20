import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production the app is served by nginx on the same origin as the API, so
// /api and /uploads are plain relative paths. `npm run dev` runs on :5173, so
// proxy those two prefixes to the local Flask server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
})
