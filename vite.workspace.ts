import { fileURLToPath } from 'node:url'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url))
const sourceExtensions = ['.ts', '.tsx', '.vue', '.js', '.mjs']

function resolveSourceFile(path: string): string | null {
  if (existsSync(path) && statSync(path).isFile()) return path

  for (const extension of sourceExtensions) {
    if (existsSync(`${path}${extension}`)) return `${path}${extension}`
    if (existsSync(resolve(path, `index${extension}`))) return resolve(path, `index${extension}`)
  }

  return null
}

/**
 * Resolves `@/` inside the app or workspace package that contains the import.
 * This is needed when Vite serves linked workspace packages directly in dev.
 */
export function workspaceSourceAlias(): Plugin {
  return {
    name: 'workspace-source-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('@/')) return null

      const sourceRootMatch = importer.match(/[\\/](apps|packages)[\\/]([^\\/]+)[\\/]src[\\/]/)
      if (!sourceRootMatch) return null

      return resolveSourceFile(
        resolve(workspaceRoot, sourceRootMatch[1], sourceRootMatch[2], 'src', source.slice(2)),
      )
    },
  }
}

export default [
  'apps/*',
  'packages/*',
]
