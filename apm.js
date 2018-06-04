const fs = require('fs')
const path = require('path')
const debug = require('debug')('amdfly')
const childProcess = require('child_process')

const amdDir = path.join(__dirname, 'amd_modules')
const amdBin = require.resolve('apmjs/bin/cli')

debug('amdBin', amdBin)

function hasInstalled(package) {
    return fs.existsSync(path.join(amdDir, `${package}.js`))
}

function install(package) {
  return new Promise((resolve, reject) => {
    const prcs = childProcess.fork(amdBin, ['install', '--', package], {
      cwd: __dirname,
      env: process.env,
      stdio: 'inherit'
    })
    prcs.on('exit', function (code) {
      if (code === 0) {
        resolve(null)
      } else {
        reject(new Error(`apmjs exit with code ${code}`))
      }
    })
  })
}

module.exports = {
  hasInstalled, install
}
