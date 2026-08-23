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
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': fileURLToPath(new URL('./index.ts', import.meta.url)),
        'adapters/payzap': fileURLToPath(new URL('./src/adapters/payzap/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: id => external.some(dep => id === dep || id.startsWith(`${dep}/`)),
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
