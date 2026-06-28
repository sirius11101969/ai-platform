import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/services/')) return 'services'
          if (id.includes('/src/assets/')) return 'assets'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
