import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { localEditor } from './scripts/local-editor.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localEditor()],
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/src/generated/catalog.json')) return 'catalog-data'
    if (id.includes('/node_modules/zrender/')) return 'chart-renderer'
  } } } },
  server: {
    host: '127.0.0.1', strictPort: true,
    watch: { ignored: ['**/public/media/**', '**/public/data/**', '**/data/**', '**/.local/**', '**/src/generated/**'] },
  },
})
