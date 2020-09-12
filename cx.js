'use strict'

var SPACE = /\s/
var MULTI_SPACE = /\s+/
var PROTO = Object.prototype
var HAS_OWN = PROTO.hasOwnProperty

function process(ref, args) {
  for (var i = 0, len = args.length, arg, str, j, len2, arr; i < len; ++i) {
    if ((arg = args[i])) {
      str = typeof arg
      if (str === 'string') {
        if (SPACE.test(arg)) {
          arr = arg.split(MULTI_SPACE)
          j = 0
          len2 = arr.length
          while (j < len2) ref[arr[j++]] = 0
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
}

function O() {}
O.prototype = Object.create(null)

module.exports = function () {
  var classNames = new O()
  process(classNames, arguments, true)
  var s = ''
  for (var c in classNames) s = s === '' ? c : s + ' ' + c
  return s
}
