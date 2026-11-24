import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the .NET backend so the app can use relative /api URLs.
    proxy: {
      '/api': 'http://localhost:5257',
    },
  },
})
