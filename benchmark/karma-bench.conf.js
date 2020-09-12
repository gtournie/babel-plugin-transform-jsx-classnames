// Note some browser launchers should be installed before using karma start.

// For example:
//      $ npm install karma-firefox-launcher
//      $ karma start --browser=Firefox

// See http://karma-runner.github.io/0.8/config/configuration-file.html

require('node-env-file')(__dirname + '/.env', { raise: false })

var browsers = {
  CHROME_V81: { base: 'SauceLabs', browserName: 'chrome', version: '81', platform: 'OS X 10.14' },
  FIREFOX_V75: { base: 'SauceLabs', browserName: 'firefox', version: '75', platform: 'OS X 10.14' },
  SAFARI_V13: { base: 'SauceLabs', browserName: 'safari', version: '13', platform: 'OS X 10.13' },
  EDGE_V80: { base: 'SauceLabs', browserName: 'MicrosoftEdge', version: '80', platform: 'Windows 10' },
  IE_V11: { base: 'SauceLabs', browserName: 'internet explorer', version: '11', platform: 'Windows 10' },
  LG_NEXUS5: {
    base: 'SauceLabs',
    appiumVersion: '1.9.1',
    browserName: 'chrome',
    deviceName: 'Android GoogleAPI Emulator',
    platform: 'Android',
    platformVersion: '8.0',
  },
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
