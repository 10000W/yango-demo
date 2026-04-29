import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import mkcert from 'vite-plugin-mkcert'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
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
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // target: 'esnext',
    // cssCodeSplit: false,
    // chunkSizeWarningLimit: 2000,
    // reportCompressedSize: true,
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //     pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    //   },
    //   format: {
    //     comments: false,
    //   },
    // },
    // lib: {
    //   entry: fileURLToPath(new URL('./src/payment-entry.ts', import.meta.url)),
    //   name: 'PaymentApp',
    //   fileName: 'payment-app',
    // },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    https: {},
  },
})
