import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import size from 'rollup-plugin-size'

const plugins = [
  typescript({
    tsconfig: 'tsconfig.json',
    removeComments: true,
    useTsconfigDeclarationDir: true,
  }),
  terser({
    include: ['jfp.js'],
  }),
  size()
]

module.exports = {
  input: 'src/index.ts',
  output: [
    { file: 'dist/jfp.umd.js', format: 'umd', name: 'jfp', sourcemap: true },
    { file: 'dist/jfp.js', format: 'esm', sourcemap: true },
    { file: 'dist/jfp.esm.js', format: 'esm', sourcemap: true },
  ],
  plugins,
}