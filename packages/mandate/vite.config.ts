import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    assetsInlineLimit: 0,
    lib: {
      formats: ['es'],
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        '@tac-crypto-payment/ui',
        '@tac-crypto-payment/sdk',
        '@tac-crypto-payment/runtime',
      ],
    },
  },
})
