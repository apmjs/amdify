const rjs = require('@oott123/r.js')
const mkdirp = require('mkdirp')
const path = require('path')

function optimize(package, version) {
  const baseDir = path.join('.', 'cache', `${package}@${version}`, 'amd_modules')
  return new Promise((resolve, reject) => {
    rjs.optimize({
      baseUrl: baseDir,
      name: package,
      optimize: 'none',
      out: `dist/${package}@${version}.js`,
      generateSourceMaps: true
    }, resolve, reject)
  })
}

module.exports = {
  optimize
}
