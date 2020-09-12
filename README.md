# babel-plugin-transform-jsx-classnames

[![Build Status](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-classnames.svg?branch=master)](https://travis-ci.org/gtournie/babel-plugin-transform-jsx-classnames)
[![Coverage Status](https://coveralls.io/repos/github/gtournie/babel-plugin-transform-jsx-classnames/badge.svg?branch=master)](https://coveralls.io/github/gtournie/babel-plugin-transform-jsx-classnames?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-transform-jsx-classnames.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-jsx-classnames)

className and styleName on steroids 💪

## Install

When babel-plugin-transform-jsx-classnames cannot resolve `className` / `styleName` during compilation, it imports a helper function (read [build time resolution](#build-time-resolution)). Therefore, you must install babel-plugin-react-css-modules as a direct dependency of the project.

```bash
$ npm install babel-plugin-transform-jsx-classnames --save
```

```js
{
  plugins: ['transform-jsx-classnames']
}
```

> Note: ⚠️ If you're using `babel-plugin-react-css-modules`, ensure you're adding `transform-jsx-classnames` **before**

## Usage

Allow you to write jsx classNames in a simpler way, without having to worry about importing a helper (like [classnames](https://www.npmjs.com/package/classnames)). `className` or `styleName` attributes take any number of arguments which can be a string, an array or an object (if the value associated with a given key is falsy, that key won't be included in the output).

## Build time resolution

The plugin will try to resolve the `className` / `styleName` during the compilation (`className={"foo", { active: true }}`) and fallback to runtime if not possible (`className={_cx("foo", { active: props.active })}` - a tiny helper (~0.3Ko) will be included automatically.

## Runtime helper

The runtime helper is very similar to the [classnames](https://www.npmjs.com/package/classnames) package. It actually behaves exactly like its [dedupe](https://www.npmjs.com/package/classnames#alternate-dedupe-version) version.

The only difference you'll find will be with full numeric classNames: output will always spit number first (ex: `className={"a", 12}` => `className="12 a"`). It shouldn't be a big problem though, as using numeric values for classNames is pretty rare.

## Performance & dedupe

Dedupe has been optimized a lot and its performance is very similar to [classnames](https://www.npmjs.com/package/classnames) (in no dedupe mode). It's even better in some cases.

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

<div className={{ foo: true }, { bar: true }}>
→ <div className="foo bar"></div>

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

```js
<div className={"foo", { active: props.active }}>
→ <div className={_cx("foo", { active: props.active })}></div>

<div className={"foo", props.active && getClassName()}>
→ <div className={_cx("foo", props.active && getClassName())}></div>
```

## Send some love

You like this package?

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/jCk0aHycU)
