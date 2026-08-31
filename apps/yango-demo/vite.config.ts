import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import mkcert from 'vite-plugin-mkcert'
import { workspaceSourceAlias } from '../../vite.workspace'
import type { Plugin } from 'vite'

export default defineConfig({
  plugins: [
    workspaceSourceAlias() as Plugin,
    vue(),
    vueDevTools(),
    mkcert(),
  ],
  resolve: {
    // The feature packages import Vue Router as a peer dependency. Ensure their
    // production bundle shares the host's injection keys with the app router.
    dedupe: ['vue', 'vue-router'],
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
