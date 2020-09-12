function data() {
  return mode() ? null : _var('BenchData')
}

function log(msg) {
  _exec('Log', msg)
}

function complete(data) {
  _exec('Complete', data)
}

function mode() {
  return !!_var('Log')
}

export { data, log, complete, mode }

// private
function _var(name) {
  return 'undefined' !== typeof window ? window['__karma' + name + '__'] : null
}

function _exec(name, arg) {
  var func = _var(name)
  func && func(arg)
}
