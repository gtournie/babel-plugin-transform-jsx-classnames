# babel-plugin-transform-jsx-classnames

[![Build Status](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-classnames.svg?branch=master)](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-classnames)
[![Coverage Status](https://coveralls.io/repos/github/gtournie/babel-plugin-transform-jsx-classnames/badge.svg?branch=master)](https://coveralls.io/github/gtournie/babel-plugin-transform-jsx-classnames?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-transform-jsx-classnames.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-jsx-classnames)

className and styleName on steroids 💪

## Usage

Allow you to write jsx classNames in a simpler way, without having to worry about importing a helper (like [clsx](https://www.npmjs.com/package/clsx) or [classnames](https://www.npmjs.com/package/classnames)). `className` or `styleName` attributes take any number of arguments which can be a string, an array or an object (if the value associated with a given key is falsy, that key won't be included in the output). [See examples](#examples)

## Install

When babel-plugin-transform-jsx-classnames cannot resolve `className` / `styleName` during compilation, it imports a helper function (read [build time resolution](#build-time-resolution)). Therefore, you must install babel-plugin-react-css-modules as a direct dependency of the project.

```bash
$ npm install babel-plugin-transform-jsx-classnames --save
```

```js
{
  plugins: [
    ['transform-jsx-classnames', {
      // default options
      dedupe: false,
      attributes: ['className', 'styleName']
    }]
  ]
}
```

> Note: ⚠️ If you're using `babel-plugin-react-css-modules`, ensure you're adding `transform-jsx-classnames` **before**

## Build time resolution

The plugin will try to resolve the `className` / `styleName` during the compilation (`className={"foo", { active: true }}`) and fallback to runtime if not possible (`className={_cx("bar", { disabled: props.disabled })}` - a tiny helper (256B minified) will be included automatically.

## Runtime helper

The runtime helper is similar to the [clsx](https://www.npmjs.com/package/clsx) package. See [examples](#runtime).

### dedupe

Dedupe behaves like the classname [dedupe](https://www.npmjs.com/package/classnames#alternate-dedupe-version) version. Way faster though. Its speed is similar to `classnames` in no dedupe version.

The only difference you'll find will be with full numeric classNames: output will always spit numbers first (ex: `className={"a", 12}` => `className="12 a"`). It shouldn't be a big deal though, as using numeric values for classNames is pretty rare and order only matters in a very few specific cases.

## Performance

See benchmark dir.

## Examples

### Build time

```html
<div className={"foo", "bar"}>
→ <div className="foo bar"></div>

<div className={'foo', { bar: true }}>
→ <div className="foo bar"></div>

<div className={{ 'foo-bar': true }}>
→ <div className="foo-bar"></div>

<div className={{ 'foo-bar': false }}>
→ <div className=""></div>

<div className={{ foo: true }, { bar: true }, ["foobar", "duck"]}>
→ <div className="foo bar foobar duck"></div>

<div className={'foo', { bar: true, duck: false }, 'baz', { quux: true }}>
→ <div className="foo bar baz quux"></div>

<!-- styleName -->
<div styleName={"foo", "bar"}>
→ <div styleName="foo bar"></div>

<!-- Dedupe -->
<div className={'foo foo', 'bar', { bar: true, foo: false }}>
→ <div className="bar"></div>

<!-- No change -->
<div className={props.active ? "foo" : "bar"}>
→ <div className={props.active ? "foo" : "bar"}></div>
```

### Runtime

When `className` / `styleName` can't be resolved at compilation.

```html
<div className={"foo", { active: props.active }}>
→ <div className={_cx("foo", { active: props.active })}></div>

<div className={{ foo: true, [`btn-${props.type}`]: true }}>
→ <div className={_cx({ foo: true, [`btn-${props.type}`]: true })}></div>

<div className={"foo", props.active && getClassName()}>
→ <div className={_cx("foo", props.active && getClassName())}></div>
```

## Send some love

You like this package?

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/jCk0aHycU)
