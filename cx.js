'use strict'

var SPACE = /\s/
var MULTI_SPACE = /\s+/
var HAS_OWN = {}.hasOwnProperty

function process(ref, args) {
  for (var i = 0, len = args.length, arg, str, j, len2, arr; i < len; ++i) {
    if ((arg = args[i])) {
      if ((str = typeof arg) === 'string') {
        if (SPACE.test(arg)) {
          for (j = 0, arr = arg.split(MULTI_SPACE), len2 = arr.length; j < len2; ++j) ref[arr[j]] = 0
        } else ref[arg] = 0
      } else if (Array.isArray(arg)) {
        process(ref, arg)
      } else if (str === 'object') {
        for (str in arg) {
          /* istanbul ignore next */
          if (HAS_OWN.call(arg, str)) {
            if (arg[str]) {
              ref[str] = 0
            } else if (0 === ref[str]) {
              delete ref[str]
            }
          }
        }
      } else if (str === 'number') {
        ref[arg] = 0
      }
    }
  }
  return ref
}

function O() {}
O.prototype = Object.create(null)

module.exports = function () {
  var s,
    c,
    classNames = process(new O(), arguments)
  for (c in classNames) s = s ? s + ' ' + c : c
  return s || ''
}
