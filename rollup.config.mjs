export default [
  {
    input: './dist/js/index.js',
    context: 'window',
    output: {
      dir: './dist/bundle/',
      format: 'umd',
      name: 'validide_logger',
      sourcemap: true
    }
  }
]
