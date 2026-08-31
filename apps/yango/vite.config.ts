import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { workspaceSourceAlias } from '../../vite.workspace'
import type { Plugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    workspaceSourceAlias() as Plugin,
    vue(),
    vueDevTools(),
  ],
  resolve: {
    // Feature packages import Vue Router as a peer dependency. Resolve it from
    // the host so all flows share the same router injection keys.
    dedupe: ['vue', 'vue-router'],
  },
})
