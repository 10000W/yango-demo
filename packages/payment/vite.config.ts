import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  /^@reown\/.*/,
  /^@wagmi\/.*/,
  /^viem.*/,
  /^tronweb.*/,
]

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@tac-crypto-payment/ui',
      '@tac-crypto-payment/sdk',
      '@tac-crypto-payment/runtime',
    ],
  },
  build: {
    assetsInlineLimit: 0,
    lib: {
      formats: ['es'],
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      fileName: 'index',
    },
    rolldownOptions: {
      external,
    },
  },
})
