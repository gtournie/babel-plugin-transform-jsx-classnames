var path = require('path')
var fs = require('fs')

var PATH = path.join(__dirname, '..', '..', '..')

var BenchReporter = function (baseReporterDecorator, logger, config) {
  // extend the base reporter
  //baseReporterDecorator(this);

  var konsole = logger.create('reporter.bench')

  // this.write = function (msg) {
  //   process.stdout.write(msg)
  // }

  this.onBrowserLog = function (browser, log, type) {
    konsole.warn('onBrowserLog: ' + log)

    var browserName = browser.name.replace(/^(\w+)(.)*$/, '$1')

    if ('data' === type) {
      fs.writeFileSync(
        path.join(PATH, config.benchOutput.replace('${browser}', browserName.toLowerCase())),
        'window.__karmaBenchData__ = window.__karmaBenchData__ || {};\n' +
          `window.__karmaBenchData__['${browser.name}'] = \n${JSON.stringify(log)};\n`,
      )
      log = 'COMPLETED\n'
    }

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    // this.write(log)
  }

  this.onRunComplete = function () {
    var output = path.join(PATH, config.benchOutput)
    var dir = path.dirname(output)
    var filePattern = path.basename(output).replace(/\$\{browser\}.*?$/, '')

    var content = fs
      .readdirSync(dir)
      .map(function (file) {
        if (0 === file.toString().indexOf(filePattern)) {
          return fs.readFileSync(path.join(dir, file)).toString()
        }
        return ''
      })
      .join('')

    fs.writeFileSync(path.join(PATH, config.benchOutput.replace('${browser}', 'all-browsers')), content)
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    konsole.warn('[OK] ' + config.benchOutput.replace('${browser}', 'all-browsers'))
    //this.write('[OK] ' + config.benchOutput.replace('${browser}', 'all-browsers'))
  }

  this.specSuccess = function () {}
  this.specFailure = function () {}
  this.onBrowserComplete = function () {}
  this.onExit = function (done) {
    done()
  }
}

BenchReporter.$inject = ['baseReporterDecorator', 'logger', 'config']

// PUBLISH
module.exports = {
  'reporter:bench': ['type', BenchReporter],
}
