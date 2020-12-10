'use strict'

var assert = require('assert')
var cx = require('../cx')
var dedupe = require('../dedupe')

;[
  ['dedupe', dedupe],
  ['fast', cx],
].forEach(([name, cx]) => {
  describe(name, function () {
    it('keeps object keys with truthy values', function () {
      assert.equal(cx({ a: true, b: false, c: 0, d: null, e: undefined, '': true, f: 1 }), 'a f')
      assert.equal(cx({ a: true, b: false, c: 0 }, { d: null, e: undefined, '': true, f: 1 }), 'a f')
    })

    it('joins arrays of class names and ignore falsy values', function () {
      assert.equal(cx(1, 'a', 0, null, undefined, true, 'b'), '1 a b')
      assert.equal(cx('foo', false, 'bar'), 'foo bar')
      assert.equal(cx('foo'), 'foo')
    })

    it('supports heterogenous arguments', function () {
      assert.equal(cx({ a: true }, 'b', 0), 'a b')
    })

    it('should be trimmed', function () {
      assert.equal(cx('', 'b', {}, ''), 'b')
    })

    it('returns an empty string for an empty configuration', function () {
      assert.equal(cx({}), '')
    })

    it('supports an array of class names', function () {
      assert.equal(cx(['a', 'b']), 'a b')
    })

    it('joins array arguments with string arguments', function () {
      assert.equal(cx(['a', 'b'], 'c'), 'a b c')
      assert.equal(cx('c', ['a', 'b']), 'c a b')
    })

    it('handles multiple array arguments', function () {
      assert.equal(cx(['a', 'b'], ['c', 'd']), 'a b c d')
    })

    it('handles arrays that include falsy and true values', function () {
      assert.equal(cx(['a', 0, null, undefined, false, true, 'b']), 'a b')
    })

    it('handles arrays that include arrays', function () {
      assert.equal(cx(['a', [['b', ['c'], 'd']], 'e']), 'a b c d e')
    })

    it('handles arrays that include objects', function () {
      assert.equal(cx(['a', { b: true, c: false }]), 'a b')
    })

    it('handles deep array recursion', function () {
      assert.equal(cx(['a', ['b', ['c', { d: true }]]]), 'a b c d')
    })

    it('handles arrays that are empty', function () {
      assert.equal(cx('a', []), 'a')
    })

    it('handles nested arrays that have empty nested arrays', function () {
      assert.equal(cx('a', [[]]), 'a')
    })

    it('handles all types of truthy and falsy property values as expected', function () {
      assert.equal(
        cx({
          // falsy:
          null: null,
          emptyString: '',
          noNumber: NaN,
          zero: 0,
          negativeZero: -0,
          false: false,
          undefined: undefined,

          // truthy (literally anything else):
          nonEmptyString: 'foobar',
          whitespace: ' ',
          function: Object.prototype.toString,
          emptyObject: {},
          nonEmptyObject: { a: 1, b: 2 },
          emptyList: [],
          nonEmptyList: [1, 2, 3],
          greaterZero: 1,
        }),
        'nonEmptyString whitespace function emptyObject nonEmptyObject emptyList nonEmptyList greaterZero',
      )
    })
  })
})

describe('dedupe', function () {
  it('should dedupe cx', function () {
    assert.equal(dedupe('foo', 'bar', 'foo foo', 'bar foo bar'), 'foo bar')
    assert.equal(dedupe('foo', 'bar', 'foo foo', 'bar', { foo: true }), 'foo bar')
  })

  it('should make sure subsequent objects can remove/add classes', function () {
    assert.equal(dedupe('foo', { foo: false }), '')
    assert.equal(dedupe('foo', { foo: false }, { foo: true, bar: true }), 'foo bar')
  })

  it('should make sure object with falsy value wipe out previous classes', function () {
    assert.equal(dedupe('foo', 0, null, undefined, true, 1, 'b', { foo: false }), '1 b')
    assert.equal(dedupe('foo', 'foobar', 'bar', { foo: false }), 'foobar bar')
    assert.equal(dedupe('foo foo', 'foobar', 'bar', { foo: false }), 'foobar bar')
    assert.equal(dedupe('foo', 'foo-bar', 'bar', { foo: false }), 'foo-bar bar')
    assert.equal(dedupe('foo', '-moz-foo-bar', 'bar', { foo: false }), '-moz-foo-bar bar')
    assert.equal(dedupe(['foo', ['b', ['c', { foo: false }]]]), 'b c')
  })
})
