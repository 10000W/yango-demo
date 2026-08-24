import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import mkcert from 'vite-plugin-mkcert'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    mkcert(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
      },
    }),
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
