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
    alias: {
      '@tac-crypto-payment/sdk': fileURLToPath(new URL('../../packages/sdk/index.ts', import.meta.url)),
      '@tac-crypto-payment/ui': fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
    },
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
