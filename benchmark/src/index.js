import classnames from 'classnames'
import classnames2 from '../../cx'
import { complete as karmaComplete } from './karma-utils'

// Fix errors:
// - MaxListenersExceededWarning (when running on saucelabs)
// - define is not defined (when running on browser)
// https://github.com/bestiejs/benchmark.js/issues/192
// https://github.com/bestiejs/benchmark.js/issues/128#issuecomment-271615298
import process from 'process'
import _ from 'lodash'
const benchmark = require('benchmark')
const Benchmark = benchmark.runInContext({ _, process })
// eslint-disable-next-line no-undef
if (typeof window !== 'undefined') window.Benchmark = Benchmark
// End of fix

Benchmark.options.maxTime = 3

function addTest(functions, queue) {
  var test = queue.shift()

  var suite = new Benchmark.Suite()
  Object.keys(functions).forEach((name) => {
    var func = functions[name]
    suite.add(name, function () {
      test(func)
    })
  })
  suite.on('cycle', function () {
    // console.log(String(event.target))
  })
  suite.on('complete', function () {
    const fastest = this.filter('fastest')
    const slowest = this.filter('slowest')

    const data = this.filter('successful').map((bench) => {
      if (_.indexOf(fastest, bench) < 0) {
        bench.speed = `${Math.round((1 - bench.hz / fastest[0].hz) * 100)}% slower`
      } else {
        const speed = bench.hz / slowest[0].hz
        bench.speed = `up to ${speed.toFixed(speed < 10 ? 1 : 0)}x faster`
      }
      const ops = Benchmark.formatNumber(bench.hz.toFixed(bench.hz < 100 ? 2 : 0))
      const rme = `(\xb1${bench.stats.rme.toFixed(2)}%)`
      return `${ops} ${rme}<br />${bench.speed}`
    })

    console.log('| ' + data.join(' | ') + ' |')

    if (queue.length) {
      setTimeout(() => addTest(functions, queue), 1500)
    } else {
      console.log('COMPLETE')
      karmaComplete({})
    }
  })
  suite.run({ async: true })
}

addTest({ classnames, classnames2 }, [
  (f) => f('abc', 'def', null, 'ghi', undefined, 'jkl', 'mno'),
  (f) => f(['abc', 'def'], ['ghi', false], ['jkl', 'mno']),
  (f) => {
    f({ abc: 1, def: 1, ghi: 1, jkl: 0, mno: 0, pqr: 0 }), f({ abc: 1, def: 1 }, { ghi: 1, jkl: 0, mno: 0, pqr: 0 })
  },
  (f) =>
    f('a-c', 'def', 'ghi', null, { jkl: 1, mno: 1 }, false, { pqr: 1, stu: 1 }, ['vwx', 'yz0'], ['_123456', 'b789']),
])
