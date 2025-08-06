import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      // any request that starts with '/api' will be forwarded to the target
      '/api': {
        target: 'http://localhost:3001', // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

