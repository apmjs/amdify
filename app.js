const express = require('express')
const morgan = require('morgan')
const validate = require('validate-npm-package-name')
const chalk = require('chalk')
const debug = require('debug')('amdfiy')
const axios = require('axios')

const rjs = require('./rjs')
const apm = require('./apm')
const registry = require('./registry')
const currentPkg = require('./package.json')

const app = express()
const port = process.env.PORT || 8132

const AMDIFY_PREFIX = chalk.cyan('amdify')

app.use(morgan('dev'))
app.use(express.static('dist'))

app.get('/', function (req, res) {
  res.json({
    usage: 'Navigate to /<pkgname>.js to get optimized amd package.',
    amdfly: currentPkg
  })
})


app.get('*.js', function (req, res, next) {
  if (!req.path.endsWith('.js')) {
    return res.end('please append .js to your url.')
  }
  const pkg = req.path.replace(/^\/+/, '').replace(/\.js$/, '')
  let [exp, pkgName, verQuery] = pkg.match(/(^.[^@]+)@?(.*)$/)
  if (!validate(pkgName).validForOldPackages) {
    return res.status(400).end('Package name invalid.')
  }
  registry.findPackageVersion(pkgName, verQuery)
  .then(ver => {
    if (ver !== verQuery) {
      return res.redirect(302, `/${pkgName}@${ver}.js`)
    }
    return servePkg(pkgName, ver)
      .then(file => {
        res.sendFile(file, { root: __dirname })
      })
  })
  .catch(err => {
    next(err)
  })
})

const installPromises = new Map()

function servePkg(pkgName, pkgVer) {
  pkgId = `${pkgName}@${pkgVer}`
  debug(`fallback to script process, ${pkgId}`)

  let promise

  if (installPromises.has(pkgId)) {
    debug(`${pkgId} promise is in the cache`)
    promise = installPromises.get(pkgId)
  } else {
    debug(`${pkgId} is not in the cache`)

    if (!apm.hasInstalled(pkgName, pkgVer)) {
      debug(`${pkgId} is not installed`)
      console.log(`${AMDIFY_PREFIX} Installing ${pkgId} ...`)
      promise = apm.install(pkgName, pkgVer)
    } else {
      debug(`${pkgId} is installed`)
      promise = Promise.resolve()
    }

    promise = promise
      .then(() => {
        console.log(`${AMDIFY_PREFIX} Optimizing ${pkgId} ...`)
        return rjs.optimize(pkgName, pkgVer)
      })
      .then((log) => {
        debug(`optimized ${pkgId}`, log)
        console.log(`${AMDIFY_PREFIX} Optimized ${pkgId}`)
      })

    installPromises.set(pkgId, promise)
  }

  return promise
  .then(() => {
    installPromises.delete(pkgId)
    return `dist/${pkgId}.js`
  }, err => {
    debug(`${pkgId} error`, err)
    throw err
  })
}

app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500).end(err.message)
})

app.listen(port, function (err) {
  if (err) {
    throw err
  }
  console.log(`${AMDIFY_PREFIX} listened on port ${port}`)
})
