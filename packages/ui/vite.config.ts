import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  /^@reown\/.*/,
  /^@wagmi\/.*/,
  /^@tonconnect\/.*/,
  /^viem.*/,
]

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
      include: ['src/index.ts', 'src/vite-env.d.ts'],
      entryRoot: 'src',
      compilerOptions: {
        composite: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@tac-crypto-payment/sdk/': fileURLToPath(new URL('../sdk/src/', import.meta.url)),
      '@tac-crypto-payment/sdk': fileURLToPath(new URL('../sdk/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      formats: ['es'],
      entry: fileURLToPath(new URL('./src/index', import.meta.url)),
      name: 'TacCryptoPaymentUI',
      fileName: () => 'tac-crypto-payment-ui.js',
    },
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    sourcemap: true,
    rollupOptions: {
      external,
      output: {
        globals: {
          'vue': 'Vue',
          'vue-router': 'VueRouter',
        },
        inlineDynamicImports: true,
      },
    },
  },
})
