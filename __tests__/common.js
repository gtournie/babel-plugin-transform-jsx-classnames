'use strict'

const path = require('path')
const babel = require('babel-core')

const transform = (code, opts) =>
  babel
    .transform(code, {
      plugins: [[path.join(__dirname, '/..'), opts]],
    })
    .code.replace('\n\n', '\n')

module.exports = {
  getCode: (source, opts) => transform(source, opts),
  getBody: (source, opts) => transform(source, opts).split('\n', 2)[1],
}
