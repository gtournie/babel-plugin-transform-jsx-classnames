import classnames from 'classnames'
import clsx from 'clsx'
import cx from '../../cx'
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
    const fastest = this.filter('fastest').sort((a, b) => (a.hz > b.hz ? -1 : 1))[0]
    const slowest = this.filter('slowest').sort((a, b) => (a.hz > b.hz ? 1 : -1))[0]

    const data = this.filter('successful').map((bench) => {
      if (fastest !== bench) {
        bench.speed = `${Math.round((1 - bench.hz / fastest.hz) * 100)}% slower`
      } else {
        const speed = bench.hz / slowest.hz
        bench.speed = `up to ${speed.toFixed(speed < 10 ? 2 : 1)}x faster`
      }
      const ops = Benchmark.formatNumber(bench.hz.toFixed(bench.hz < 100 ? 2 : 0))
      const rme = `(\xb1${bench.stats.rme.toFixed(2)}%)`
      return `${ops} ${rme} ${bench.speed}`
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

addTest({ cx, clsx }, [
  (f) => {
    f('classname'), f('foo', 'bar', 'foobar'), f('abc', 'def', null, 'ghi', undefined, '', 'jkl', 'mno')
  },
  (f) => {
    f(['abc', 'def'], ['ghi', false], ['jkl', ['mno']], []), f(['abc', 'def', false])
  },
  (f) => {
    f({ abc: 1, def: 1, ghi: 1, jkl: 0, mno: 0, pqr: 0 }), f({ abc: 1, def: 1 }, { ghi: 1, jkl: 0, mno: 0, pqr: 0 })
  },
  (f) => {
    f('a-c', 'def', 'ghi', null, { jkl: 1, mno: 1, pqr: 0, stu: 0 }, false, ['vwx', 'yz0', '_123456', 'b789'])
  },
])
