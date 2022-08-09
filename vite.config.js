import { defineConfig } from "vite";
import vitePluginResolveExternals from 'vite-plugin-resolve-externals'

// import path from 'path'

export default defineConfig({
    port: '8000',
    esbuild: {
      jsxFactory: 'j',
      jsxFragment: 'Fragment',
      target: 'es2020',
      format: 'esm'
    },
    resolve: {
      externals: {
        jfp: ()=>`
        export * from './dist/jfp.esm.js'
        `,
      },
    },
    server: {
      port: 3000
    },
    plugins: [
      vitePluginResolveExternals({
        jfp: 'jfp'
      })
    ]
  })