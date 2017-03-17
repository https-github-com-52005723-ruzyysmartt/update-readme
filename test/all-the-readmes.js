'use strict'
const chalk = require('chalk')
const jsdiff = require('diff')
const registry = require('package-stream')()
const parse = require('../parser')
const render = require('../render')

registry.on('package', (pkg) => {
  if (pkg.readme) {
    process.stdout.write('.')
    try {
      var readme = pkg.readme
      var readmeParse = parse(readme)
    } catch (e) {
      process.stdout.write(`\nParse failure for '${pkg.name}'\n`)
      process.stderr.write(e)
      process.stderr.write(pkg.readme)
      return
    }
    try {
      var readmeRender = render(readmeParse)
    } catch (e) {
      process.stdout.write(`\nRender failure for '${pkg.name}'\n`)
      process.stderr.write(e)
      process.stderr.write(pkg.readme)
      return
    }
    if (readmeRender !== readme) {
      process.stdout.write(`\nNon-identity transform for package '${pkg.name}'\n`)
      var diff = jsdiff.diffLines(readme, readmeRender)
 
      diff.forEach(function(part){
        // green for additions, red for deletions
        // grey for common parts
        if (part.added) {
          process.stdout.write(chalk.green(part.value))
        } else if (part.removed) {
          process.stdout.write(chalk.red(part.value))
        } else {
          process.stdout.write(chalk.gray(part.value))
        }
      })
      return
    }
  }
})
registry.on('end', () => {
  process.stderr.write('DONE')
  process.exit(0)
})