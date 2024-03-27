import { resolve } from 'path'

import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['lowdb']
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('lowdb')) {
              return 'lowdb'
            }
            return undefined // let rollup handle all other node_modules
          }
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@lib': resolve('src/lib')
      }
    },
    // public 目录下的文件可以直接通过 / 访问
    publicDir: resolve('src/renderer/public'),
    plugins: [solid()]
  }
})
