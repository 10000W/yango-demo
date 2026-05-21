import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src/**/*.ts', 'index.ts'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./index.ts', import.meta.url)),
      name: 'TacCryptoPaymentSDK',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'tac-crypto-payment-sdk.mjs'
          case 'cjs':
            return 'tac-crypto-payment-sdk.cjs'
          default:
            throw new Error('Unknown format')
        }
      },
    },
    rollupOptions: {
      external,
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
