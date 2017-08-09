'use strict'
require('@iarna/cli')(main)
  .usage('replace-deep-dep <depname> <oldVersion> <newVersion>')
  .demand(3)

const fs = require('fs')
const detectIndent = require('detect-indent')

function main (opts, pkgname, oldver, newver) {
  let filename
  let data
  try {
    filename = 'npm-shrinkwrap.json'
    data = fs.readFileSync(filename, 'utf8')
  } catch (ex) {
    if (ex.code !== 'ENOENT') throw ex
    try {
      filename = 'package-lock.json'
      data = fs.readFileSync(filename, 'utf8')
    } catch (ex) {
      if (ex.code !== 'ENOENT') throw ex
      console.error('replace-deep-dep:', 'Must be run in a directory with a package-lock.json or npm-shrinkwrap.json')
      throw 1
    }
  }
  const indent = detectIndent(data)
  let indentBy = (indent.type === 'space' && indent.amount) || 2
  let plock
  try {
    plock = JSON.parse(data)
  } catch (ex) {
    console.error('replace-deep-dep:', `Error parsing "${filename}": ${ex.messsage}`)
    throw 1
  }

  if (!plock.requires) {
    console.error('Please update to 5.3.0 and run `npm install` to update your ' + filename)
    process.exit(1)
  }

  const found = recurse(plock)
  if (found) {
    console.error('replace-deep-dep:', `${pkgname}@${oldver} found and updated to ${newver}`)
    fs.writeFileSync(filename, JSON.stringify(plock, null, indentBy) + '\n')
    console.error('replace-deep-dep:', `${filename} updated`)
  } else {
    console.error('replace-deep-dep:', `No instances of ${pkgname}@${oldver} found`)
  }
  return Promise.resolve()

  function recurse (plock) {
    let found = false
    if (!plock.dependencies) return found
    Object.keys(plock.dependencies).forEach(name => {
      const dep = plock.dependencies[name]
      if (name === pkgname && dep.version === oldver) {
        found = true
        dep.version = newver
        delete dep.resolved
        delete dep.integrity
        delete dep.requires
      }
      if (dep.requires) {
        Object.keys(dep.requires).forEach(name => {
          if (name === pkgname && dep.requires[name] === oldver) {
            dep.requires[name] = newver
          }
        })
      }
      found = found || recurse(dep)
    })
    return found
  }
}

