const rjs = require('requirejs')

function optimize(package) {
  return new Promise((resolve, reject) => {
    rjs.optimize({
      baseUrl: 'amd_modules',
      name: package,
      optimize: 'none',
      out: `dist/${package}.js`,
      generateSourceMaps: true
    }, resolve, reject)
  })
}

module.exports = {
  optimize
}
