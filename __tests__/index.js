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
    assert.strictEqual(c.getCode('<div className={"fb bf", 0, `foo`} />;'), '<div className="fb bf foo" />;')
    assert.strictEqual(
      c.getCode('<div className={"fb bf", `foo ${"gg"} bar`} />;'),
      '<div className="fb bf foo gg bar" />;',
    )
    assert.strictEqual(
      c.getCode('<div className={"fb bf", `foo${`${10}`}bar`} />;'),
      '<div className="fb bf foo10bar" />;',
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
    assert.strictEqual(c.getCode('<div className={`fb bf`} />;'), '<div className={`fb bf`} />;')
    assert.strictEqual(c.getCode('<div className={`fb ${"fbf"} bf`} />;'), '<div className={`fb ${"fbf"} bf`} />;')
    assert.strictEqual(c.getCode('<div className={`fb ${cmod()} bf`} />;'), '<div className={`fb ${cmod()} bf`} />;')
    assert.strictEqual(c.getCode('<div className={[`foo`]} />;'), '<div className="foo" />;')
    assert.strictEqual(c.getCode('<div className={[[`foo ${cmod()}`]]} />;'), '<div className={`foo ${cmod()}`} />;')
    assert.strictEqual(c.getCode('<div className={{ ["foo"]: 1, bar: 1 }} />;'), '<div className="foo bar" />;')
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
      c.getBody('<div className={[null, "fb", { foo: cmod(), bar: "bar" }, ["elem"]]} />;'),
      '<div className={_cx("fb", { foo: cmod(), bar: 1 }, "elem")} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"fb bf-" + cmod()} />;'),
      '<div className={_cx("fb bf-" + cmod())} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={["fb", cmod(), { foo: cmod(), bar: "bar" }]} />;'),
      '<div className={_cx("fb", cmod(), { foo: cmod(), bar: 1 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foobar", cmod() ? "foo" : "bar"} />;'),
      '<div className={_cx("foobar", cmod() ? "foo" : "bar")} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={["foo", `fb ${cmod()} bf`]} />;'),
      '<div className={_cx("foo", `fb ${cmod()} bf`)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={[null, cbmod(), { foo: true }, ["el1", [["el2"], { bar: false }]]]} />;'),
      '<div className={_cx(cbmod(), { foo: 1 }, "el1", "el2", { bar: 0 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"fb bf", undefined} />;'),
      '<div className={_cx("fb bf", undefined)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={true ? "a" : cbmod()} />;'),
      '<div className={_cx(true ? "a" : cbmod())} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={cmod() ? "a" : false ? false : null} />;'),
      '<div className={_cx(cmod() ? "a" : false ? false : null)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={true ? "a" : cmod() ? false : null} />;'),
      '<div className={_cx(true ? "a" : cmod() ? false : null)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={{ ["foo"]: cmod(), bar: 1 }} />;'),
      '<div className={_cx({ ["foo"]: cmod(), bar: 1 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={{ ["10"]: cmod(), bar: 1 }} />;'),
      '<div className={_cx({ ["10"]: cmod(), bar: 1 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foobar", { [`foo`]: cmod(), bar: 1 }} />;'),
      '<div className={_cx("foobar", { [`foo`]: cmod(), bar: 1 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foobar", { [`foo${cmod()}`]: 1, bar: 1 }} />;'),
      '<div className={_cx("foobar", { [`foo${cmod()}`]: 1, bar: 1 })} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foobar", `${cmod() ? "foo": "bar"}`} />;'),
      '<div className={_cx("foobar", `${cmod() ? "foo" : "bar"}`)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foo", `${cmod()}`} />;'),
      '<div className={_cx("foo", `${cmod()}`)} />;',
    )
    assert.strictEqual(
      c.getBody('<div className={"foo", `${{ a: 1 }}`} />;'),
      '<div className={_cx("foo", `${{ a: 1 }}`)} />;',
    )
  })
})
