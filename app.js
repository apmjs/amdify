const express = require('express')
const morgan = require('morgan')
const validate = require("validate-npm-package-name")
const debug = require('debug')('amdfly')

const rjs = require('./rjs')
const apm = require('./apm')
const currentPkg = require('./package.json')

const app = express()
const port = process.env.PORT || 8132

app.use(morgan('dev'))
app.use(express.static('dist'))

app.get('/', function (req, res) {
  res.json({
    usage: 'Navigate to /<pkgname>.js to get optimized amd package.',
    amdfly: currentPkg
  })
})

const installPromises = new Map()

app.get('*.js', function (req, res, next) {
  if (!req.path.endsWith('.js')) {
    return res.end('please append .js to your url.')
  }
  const pkg = req.path.replace(/^\/+/, '').replace(/\.js$/, '')
  if (!validate(pkg).validForOldPackages) {
    return res.status(400).end('Package name invalid.')
  }
  debug(`fallback to script process, ${pkg}`)

  let promise

  if (installPromises.has(pkg)) {
    debug(`${pkg} promise is in the cache`)
    promise = installPromises.get(pkg)
  } else {
    debug(`${pkg} is not in the cache`)

    if (!apm.hasInstalled(pkg)) {
      debug(`${pkg} is not installed`)
      console.log(`[amdfiy] Installing ${pkg} ...`)
      promise = apm.install(pkg)
    } else {
      debug(`${pkg} is installed`)
      promise = Promise.resolve()
    }

    promise = promise
      .then(() => {
        console.log(`[amdfiy] Optimizing ${pkg} ...`)
        return rjs.optimize(pkg)
      })
      .then((log) => {
        debug(`optimized ${pkg}`, log)
        console.log(`[amdfiy] Optimized ${pkg}`)
      })

    installPromises.set(pkg, promise)
  }

  promise.then(() => new Promise((resolve, reject) => {
    res.sendFile(`dist/${pkg}.js`, {
      root: __dirname
    }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  }))
  .catch(err => {
    debug(`${pkg} error`, err)
    next(err)
  })
  .then(() => {
    installPromises.delete(pkg)
  })
})

app.listen(port, function (err) {
  if (err) {
    throw err
  }
  console.log(`amdfiy listened on port ${port}`)
})
