import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Vendor chunks: long-lived and cacheable across deploys. supabase is only pulled in by dynamic import.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(id)) return 'motion'
          if (/node_modules\/@supabase\//.test(id)) return 'supabase'
          return undefined
        },
      },
    },
  },
})
