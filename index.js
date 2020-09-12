const _cx = require('./cx')

const PRIMITIVE_TYPES = ['NullLiteral', 'BooleanLiteral', 'NumericLiteral', 'StringLiteral']

module.exports = function (base) {
  const t = base.types

  const requireCx = (cxFunc) => {
    return [
      t.ImportDeclaration(
        [t.ImportDefaultSpecifier(cxFunc)],
        t.StringLiteral('babel-plugin-transform-jsx-classnames/cx'),
      ),
    ]
  }

  const checkChanges = (info, node) => {
    switch (node.type) {
      case 'NullLiteral':
      case 'NumericLiteral':
      case 'StringLiteral':
        return info
      case 'ConditionalExpression':
        checkChanges(info, node.consequent)
        checkChanges(info, node.alternate)
        return info
    }
    info.change = true
    return info
  }

  const extractArgs = (attrs, info = {}, depth = 0) => {
    const args = attrs.reduce((acc, attr) => {
      if (info.onRuntime) return acc
      switch (attr.type) {
        case 'NullLiteral':
        case 'StringLiteral':
        case 'NumericLiteral':
          acc.push(attr.value)
          return acc
        // eslint-disable-next-line no-fallthrough
        case 'ArrayExpression':
          acc.push.apply(acc, extractArgs(attr.elements, info, depth + 1).args)
          return acc
        case 'ObjectExpression':
          acc.push(
            attr.properties.reduce((h, prop) => {
              if (
                prop.type === 'ObjectProperty' &&
                prop.key &&
                prop.value &&
                PRIMITIVE_TYPES.includes(prop.value.type)
              ) {
                h[prop.key.name] = prop.value.value
              } else {
                info.onRuntime = true
              }
              return h
            }, {}),
          )
          return acc
        case 'ConditionalExpression':
          info.noChange = depth === 0 && attrs.length === 1 && !checkChanges({}, attr).change
      }
      info.onRuntime = true
      return acc
    }, [])
    return { args, ...info }
  }

  const callCx = (prop, cxFunc, attrs, _cx, use) => {
    const values = extractArgs(attrs)
    if (values.noChange) {
      return null
    }
    if (values.onRuntime) {
      use.flag = true
      if (attrs.length === 1 && attrs[0].type === 'ArrayExpression') attrs = attrs[0].elements
      return t.JSXAttribute(t.JSXIdentifier(prop), t.JSXExpressionContainer(t.CallExpression(cxFunc, attrs)))
    }
    return t.JSXAttribute(t.JSXIdentifier(prop), t.stringLiteral(_cx(values.args)))
  }

  const readAttributes = (path) => {
    const info = {}
    ;['className', 'styleName'].forEach((prop) => {
      const paths = []
      let attrs = []

      const readAttribute = (name, value, p) => {
        switch (name) {
          case prop:
            if (!value || t.isStringLiteral(value)) return
            if (t.isJSXExpressionContainer(value)) {
              value = value.expression
            }
            if (!value.expressions && (t.isBooleanLiteral(value) || t.isNullLiteral(value)) && !value.value) return
            paths.push(p)
            attrs = value.expressions || [value]
            break
        }
      }

      const attributes = path.node.openingElement.attributes
      for (let i = 0, len = attributes.length; i < len; i++) {
        if (attributes[i].type === 'JSXSpreadAttribute') {
          path.get('openingElement.attributes.' + i).traverse({
            ObjectProperty(propPath) {
              const prop = propPath.node
              readAttribute(prop.key.name, prop.value, propPath)
            },
          })
          continue
        }

        const name = attributes[i].name.name
        const value = attributes[i].value
        const p = path.get('openingElement.attributes.' + i)
        readAttribute(name, value, p)
      }

      info[prop] = { paths, attrs }
    })
    return info
  }

  const mutateAttributes = (path, info, cxFunc, _cx, use) => {
    Object.keys(info).forEach((prop) => {
      const attributes = info[prop]
      if (!attributes.attrs.length) return
      const attrValue = callCx(prop, cxFunc, attributes.attrs, _cx, use)
      if (attrValue === null) return
      path.get('openingElement').pushContainer('attributes', attrValue)
      attributes.paths.forEach((path) => path.remove())
    })
  }

  const JSXChildElementVisitor = {
    JSXElement(path) {
      mutateAttributes(path, readAttributes(path), this.cxFunc, this._cx, this.use)
    },
  }

  const JSXRootElementVisitor = {
    JSXElement(path) {
      const cxFunc = this.cxFunc
      const _cx = this._cx
      const use = this.use
      mutateAttributes(path, readAttributes(path), cxFunc, _cx, use)
      path.traverse(JSXChildElementVisitor, { cxFunc, _cx, use })
      path.stop()
    },
  }

  return {
    visitor: {
      Program(path /*, state*/) {
        const cxFunc = path.scope.generateUidIdentifier('_cx')
        const use = { flag: false }
        path.traverse(JSXRootElementVisitor, { cxFunc, use, _cx })
        if (use.flag) {
          path.unshiftContainer('body', requireCx(cxFunc))
        }
      },
    },
    inherits: require('babel-plugin-syntax-jsx'),
  }
}
