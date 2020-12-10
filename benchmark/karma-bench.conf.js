// Note some browser launchers should be installed before using karma start.

// For example:
//      $ npm install karma-firefox-launcher
//      $ karma start --browser=Firefox

// See http://karma-runner.github.io/0.8/config/configuration-file.html

require('node-env-file')(__dirname + '/.env', { raise: false })

var browsers = {
  CHROME_V87: { base: 'SauceLabs', browserName: 'chrome', version: '87', platform: 'OS X 10.15' },
  FIREFOX_V83: { base: 'SauceLabs', browserName: 'firefox', version: '83', platform: 'OS X 10.15' },
  SAFARI_V14: { base: 'SauceLabs', browserName: 'safari', version: '14' },
  EDGE_V86: { base: 'SauceLabs', browserName: 'MicrosoftEdge', version: '86', platform: 'OS X 10.15' },
  // IE_V11: { base: 'SauceLabs', browserName: 'internet explorer', version: '11', platform: 'Windows 10' },
}

module.exports = function (config) {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Sauce environments not set --- Skipping')
    return process.exit(0)
  }

  config.set({
    basePath: '',
    concurrency: 1,
    frameworks: ['bench'],
    logLevel: config.LOG_INFO,
    port: 9876,

    // list of files / patterns to load in the browser
    files: ['dist/main.js'],

    // Test results reporter to use
    reporters: ['bench'],
    benchOutput: 'dist/benchmarks-${browser}.js',

    sauceLabs: {
      testName: 'classnames2 benchmarks',
      startConnect: true,
    },
    // captureConsole: true,
    captureTimeout: 120000,
    browserNoActivityTimeout: 120000,
    browserDisconnectTolerance: 2,
    customLaunchers: browsers,
    browsers: Object.keys(browsers),
    singleRun: true,
  })
}
