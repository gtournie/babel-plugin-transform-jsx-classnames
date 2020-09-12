import _ from 'lodash'
import $ from 'jquery'
import Benchmark from 'benchmark'

import { log as karmaLog, complete as karmaComplete, mode as karmaMode } from './karma-utils'

var HTML_BENCH_TEMPLATE =
  '\
<div>\
  <span class="anchor"></span>\
  <h1 class="bench-name"></h1>\
  <div class="run"><button type="button" class="btn btn-secondary">Run</button></div>\
  <table class="table table-striped">\
    <thead>\
      <tr>\
        <th>moment.js</th>\
        <th><span>ops/sec</span></th>\
        <th>Time.js</th>\
        <th><span>ops/sec</span></th>\
      </tr>\
    </thead>\
    <tbody></tbody>\
  </table>\
</div>\
'

var HTML_COL_TEMPLATE =
  '\
<td class="name">\
  <span class="text"></span>\
</td>\
<td class="result">\
  <span class="ops"></span>\
  <span class="rme"></span>\
  <span class="speed"></span>\
</td>\
'

var RUN_TEXT = 'Run'
var ABORT_TEXT = 'Stop'

function TimeBench(options) {
  var that = this
  var $parent = $(options.parent || '.bench-container')
  var $menu = $(options.menu || '.bench-menu')
  if (!$parent.length) {
    $parent = $('body')
  }
  this.$container = $(HTML_BENCH_TEMPLATE).appendTo($parent)
  this.tests = []
  this.data = {}
  this.name = options.name

  this.$container.data('TimeBench', this)
  this.$container.find('.bench-name').text(this.name)

  var slug = this.name.replace(/[^a-z0-9]/gi, '-').replace(/-{2,}/gi, '-')
  this.$container.find('.anchor').attr('id', slug)
  $menu.append('<li><a href="#' + slug + '">' + this.name + '</a></li>')

  var $button = (this.$button = this.$container.find('button').on('click', function () {
    if (RUN_TEXT === $button.text()) {
      $button.text(ABORT_TEXT)
      that.run()
    } else {
      TimeBench.stop()
      $button.text(RUN_TEXT)
    }
  }))

  TimeBench._data[this.name] = this.data

  if (options.beforeEach) {
    this.beforeEach(options.beforeEach)
  }
  _.each(options.benches, function (bench) {
    that.add(bench)
  })
}

TimeBench._data = {}
TimeBench._isRunning = false
TimeBench._callbacks = []
TimeBench._suites = []
TimeBench.onComplete = function () {
  karmaComplete(TimeBench._data)
}

TimeBench.stop = function () {
  TimeBench._stop = true
  TimeBench._callbacks = []
  _.each(TimeBench._suites, function (b) {
    b.reset()
  })
  TimeBench._isRunning = false
}

TimeBench.prototype.run = function () {
  TimeBench._stop = false
  var that = this

  // clean up
  this.$container.find('.result').removeClass('slowest fastest').find('.ops, .rme, .speed').empty()
  _.each(this.tests, function (benches) {
    _.each(benches, function (b) {
      delete that.data[b.name]
    })
  })

  var onComplete = function () {
    this.$button.text(RUN_TEXT)
  }

  var job = [this.tests.slice(0), _.bind(onComplete, this)]

  // put the job in a queue if busy
  if (TimeBench._isRunning) {
    return TimeBench._callbacks.push(job)
  }

  // run
  TimeBench._isRunning = true
  _run.apply(null, job)
  return this

  function _run(array, callback) {
    if (!array.length) {
      callback && callback()

      if (TimeBench._callbacks.length) {
        // global queue
        _run.apply(null, TimeBench._callbacks.shift())
      } else {
        // global queue empty
        TimeBench._isRunning = false
        TimeBench.onComplete && TimeBench.onComplete()
      }
      return
    }

    // local queue
    var current = array.shift()
    var onEnd = function () {
      current.off('complete', onEnd)
      if (!TimeBench._stop) {
        _run(array, callback)
      }
    }
    current.on('complete', onEnd).run({ async: true })
  }
}

TimeBench.prototype.update = function (data) {
  if (!data) return this
  data = data[this.name]
  if (!data) return

  var that = this
  _.each(this.tests, function (benches) {
    _.each(benches, function (b) {
      if (data[b.name]) {
        that.updateCol(b.name, data[b.name])
      }
    })
  })
  return this
}

// update a table cell and store the data
TimeBench.prototype.updateCol = function (name, options) {
  this.data[name] = this.data[name] || {}
  $.extend(this.data[name], options)

  var $cell = this.$container.find('[data-name="' + name + '"]')

  if (options.hz) {
    $cell.find('.ops').text(Benchmark.formatNumber(options.hz.toFixed(options.hz < 100 ? 2 : 0)))
  }
  if (options.rme) {
    $cell.find('.rme').text('(\xb1' + options.rme.toFixed(2) + '%)')
  }
  if (options.result) {
    $cell.addClass(options.result)
  }
  if (options.speed) {
    $cell.find('.speed').text(options.speed)
  }
}

TimeBench.prototype.beforeEach = function (func) {
  this._onEach = func
  _.each(this.tests, function (suite) {
    suite.on('start', func)
  })
  return this
}

// add html template and add the test to the local queue
TimeBench.prototype.add = function (conf) {
  var suite = new Benchmark.Suite()
  var $html = $('<tr></tr>')
  var target,
    pair,
    index = 0,
    that = this

  var tests = conf.tests
  suite.name = conf.name
  suite.calls = conf.calls

  for (var i = 0, len = tests.length; i < len; ++i) {
    pair = tests[i]
    if ('string' === typeof pair) {
      pair = [pair, new Function(pair)]
    }
    suite.add.apply(suite, pair)
    var html = $('<tr></tr>')
      .append(HTML_COL_TEMPLATE)
      .find('.text')
      .text(pair[0])
      .end()
      .find('.result')
      .attr('data-name', pair[0])
      .end()
      .html()
    $html.append(html)
  }

  this.$container.find('tbody').append($html)

  if (this._onEach) {
    suite.on('start', this._onEach)
  }

  suite
    .on('cycle', function (event) {
      if (TimeBench._stop) return

      target = event.target
      that.updateCol(target.name, { hz: target.hz * conf.calls, rme: target.stats.rme })

      karmaLog('Testing: ' + target.name)
    })
    .on('complete', function () {
      var benches = this.filter('successful'),
        fastest = this.filter('fastest'),
        slowest = this.filter('slowest'),
        text,
        $cell,
        klass,
        sp,
        name

      if (benches.length < 2 || TimeBench._stop) return

      // highlight result cells
      for (var i = 0, len = benches.length, bench; i < len; ++i) {
        bench = benches[i]
        $cell = $html.find('[data-name="' + bench.name + '"]')

        if (_.indexOf(fastest, bench) >= 0) {
          klass = 'fastest'
          sp = bench.hz / slowest[0].hz
          text = 'up to ' + sp.toFixed(sp < 10 ? 1 : 0) + 'x faster'
        } else {
          text = Math.round((1 - bench.hz / fastest[0].hz) * 100) + '% slower'

          // mark slowest
          if (_.indexOf(slowest, bench) >= 0) {
            klass = 'slowest'
          }
        }

        that.updateCol(bench.name, { result: klass, speed: text })
      }
    })

  this.tests.push(suite)
  TimeBench._suites.push(suite)
  return this
}

export { TimeBench }
