const semver = require('semver')
const axios = require('axios')

function findPackageVersion(pkgName, verQuery = '*') {
  return axios.get(`https://registry.npm.taobao.org/${pkgName}`)
  .then(resp => {
    const version = resp.data['dist-tags'][verQuery]
    if (version) {
      return version
    }
    if (resp.data.versions[verQuery]) {
      return verQuery
    }
    const versions = Object.keys(resp.data.versions).filter(ver => {
      return semver.satisfies(ver, verQuery)
    }).sort((a, b) => {
      return -semver.compare(a, b)
    })
    if (versions[1]) {
      return versions[1]
    }
    throw new Error('No version matches ' + verQuery)
  })
}

function hasVersion(pkgName, version) {
  return axios.get(`https://registry.npm.taobao.org/${pkgName}/${version}`)
  .then(function () {
    return true
  })
  .catch(function () {
    return false
  })
}

module.exports = {
  findPackageVersion: findPackageVersion,
  hasVersion: hasVersion
}
