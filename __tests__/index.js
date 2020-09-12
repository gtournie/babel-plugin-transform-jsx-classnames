'use strict'

const c = require('./common')
const assert = require('assert')

describe('base', function () {
  it('should generate the className on build time', function () {
    assert.strictEqual(c.getCode('<div />;'), '<div />;')
    assert.strictEqual(c.getCode('<div className />;'), '<div className />;')
    assert.strictEqual(c.getCode('<div className="" />;'), '<div className="" />;')
    assert.strictEqual(c.getCode('<div className={""} />;'), '<div className="" />;')
    assert.strictEqual(c.getCode('<div className={null} />;'), '<div className={null} />;')
    assert.strictEqual(c.getCode('<div className={false} />;'), '<div className={false} />;')
    assert.strictEqual(c.getCode('<div className="element" />;'), '<div className="element" />;')
    assert.strictEqual(c.getCode('<div className={12} />;'), '<div className="12" />;')
    assert.strictEqual(c.getCode('<div className={["element", "foo"]} />;'), '<div className="element foo" />;')
    assert.strictEqual(
      c.getCode('<div className={["element", "foo", ["bar", { block: true }]]} />;'),
      '<div className="element foo bar block" />;',
    )
    assert.strictEqual(
      c.getCode('<div className={["element", "foo foo", ["bar", { block: true, foo: true }]]} />;'),
      '<div className="element foo bar block" />;',
    )
    assert.strictEqual(
      c.getCode('<div className={["element", "foo foo", ["bar", { block: true, foo: false }]]} />;'),
      '<div className="element bar block" />;',
    )
    assert.strictEqual(
      c.getCode('<div><div className={["element", "foo", "foo", ["bar", { block: true, foo: false }]]} /></div>;'),
      '<div><div className="element bar block" /></div>;',
    )
    assert.strictEqual(c.getCode('<div className={["element"]} />;'), '<div className="element" />;')
    assert.strictEqual(c.getCode('<div className={true ? "a" : "b"} />;'), '<div className={true ? "a" : "b"} />;')
    assert.strictEqual(
      c.getCode('<div className={`${true ? "a" : "b"}`} />;'),
      '<div className={`${true ? "a" : "b"}`} />;',
    )
    assert.strictEqual(
      c.getCode('<div className={true ? "a" : false ? "b" : 12} />;'),
      '<div className={true ? "a" : false ? "b" : 12} />;',
    )
    assert.strictEqual(
      c.getCode('<div className={"element", { foo: true }, ["bar", "foo"]} />;'),
      '<div className="element foo bar" />;',
    )
    assert.strictEqual(
      c.getCode('<div {...{ className: ("element", { foo: true }, ["bar", "foo"]) }} />;'),
      '<div {...{}} className="element foo bar" />;',
    )
    assert.strictEqual(
      c.getCode('<div {...{ foo: "bar", className: ("element", { foo: true }, ["bar", "foo"]) }} />;'),
      '<div {...{ foo: "bar" }} className="element foo bar" />;',
    )
    assert.strictEqual(
      c.getCode(
        '<div {...{ foo: "bar", styleName: ["foo", "bar"], className: ("element", { foo: true }, ["bar", "foo"]) }} />;',
      ),
      '<div {...{ foo: "bar" }} className="element foo bar" styleName="foo bar" />;',
    )
  })

  it('should generate the className on run time', function () {
    assert.strictEqual(c.getBody('<div className={cbmod()} />;'), '<div className={_cx(cbmod())} />;')
    assert.strictEqual(
      c.getBody('<div className={{ foo: new Date() }} />;'),
      '<div className={_cx({ foo: new Date() })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"element", cbmod()} />;'),
      '<div className={_cx("element", cbmod())} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={[null, cbmod(), ["element"]]} />;'),
      '<div className={_cx(null, cbmod(), ["element"])} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={true ? "a" : cbmod()} />;'),
      '<div className={_cx(true ? "a" : cbmod())} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={true ? "a" : false ? false : null} />;'),
      '<div className={_cx(true ? "a" : false ? false : null)} />;',
    )
  })
})
