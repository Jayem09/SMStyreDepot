import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and core routing libraries
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // UI and animation libraries
          'ui-vendor': ['motion/react', 'sonner', 'lucide-react', 'react-helmet-async'],
          // Admin panel code (won't load for regular customers)
          'admin': [
            './src/app/components/admin/AdminRoute',
            './src/app/components/admin/AdminStats',
            './src/app/components/admin/AdminOrders',
            './src/app/components/admin/AdminProducts',
            './src/app/components/admin/AdminBrands',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
