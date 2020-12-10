'use strict'

var HAS_OWN = {}.hasOwnProperty

function getClass(arg) {
  if (typeof arg === 'string') return arg

  var s,
    className = ''
  if (Array.isArray(arg)) {
    for (var k = 0, len = arg.length; k < len; ++k) {
      if ((s = arg[k]))
        if ((s = getClass(s))) {
          if (className) className += ' '
          className += s
        }
    }
    return className
  }
  if (typeof arg === 'object') {
    for (s in arg) {
      if (arg[s] && s) {
        /* istanbul ignore next */
        if (HAS_OWN.call(arg, s)) {
          if (className) className += ' '
          className += s
        }
      }
    }
    return className
  }
  if (typeof arg === 'number') return '' + arg
  return className
}

module.exports = function (arg0) {
  var className = '',
    len = arguments.length,
    str
  // Most common cases. Though a bit redundant, it's just way faster...
  if (1 == len) {
    if (typeof arg0 === 'string') return arg0
    if (!Array.isArray(arg0) && typeof arg0 === 'object') {
      for (str in arg0) {
        if (arg0[str] && str) {
          /* istanbul ignore next */
          if (HAS_OWN.call(arg0, str)) {
            if (className) className += ' '
            className += str
          }
        }
      }
      return className
    }
  }
  // General cases
  for (var i = 0; i < len; ++i) {
    if ((str = arguments[i]))
      if ((str = getClass(str))) {
        if (className) className += ' '
        className += str
      }
  }
  return className
}
