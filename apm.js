const fs = require('fs')
const path = require('path')
const debug = require('debug')('amdfiy')
const childProcess = require('child_process')
const mkdirp = require('mkdirp')

const cacheDir = path.join('.', 'cache')
const amdBin = require.resolve('apmjs/bin/cli')

debug('amdBin', amdBin)

function hasInstalled(package, version = '*') {
    return fs.existsSync(path.join(cacheDir, `${package}@${version}`, 'amd_modules', `${package}.js`))
}

function install(package, version = '*') {
  const baseDir = path.join(cacheDir, `${package}@${version}`)
  mkdirp.sync(baseDir)
  const packageJson = path.join(baseDir, 'package.json')
  if (!fs.existsSync(packageJson)) {
    fs.writeFileSync(packageJson, JSON.stringify({
      name: 'cache',
      version: '0'
    }))
  }
  return new Promise((resolve, reject) => {
    const prcs = childProcess.fork(amdBin, ['install', '--', `${package}@${version}`], {
      cwd: baseDir,
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

// install('ralltiir-application', '4.5.0-0').then(console.log, console.log)
