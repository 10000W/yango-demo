import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    mkcert(),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  optimizeDeps: {
    exclude: ['@tac-crypto-payment/sdk', '@tac-crypto-payment/ui'],
  },
  server: {
    https: {},
    port: 3000,
    host: '0.0.0.0',
    fs: {
      allow: ['../..'],
    },
  },
})
