const cx = require('./cx')
const dedupe = require('./dedupe')

const PRIMITIVE_TYPES = ['NullLiteral', 'BooleanLiteral', 'NumericLiteral', 'StringLiteral']
const SIMPLE_PROP_KEY_TYPES = ['Identifier', 'StringLiteral']

module.exports = function (base) {
  const t = base.types

  const requireCx = (fileName) => {
    return [
      t.ImportDeclaration(
        [t.ImportDefaultSpecifier(cxId)],
        t.StringLiteral('babel-plugin-transform-jsx-classnames/' + fileName),
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
      switch (attr.type) {
        case 'TemplateLiteral':
          info.onRuntime = true
          return acc
        case 'StringLiteral':
          acc.push(attr.value.trim())
          return acc
        case 'NumericLiteral':
          if (attr.value) acc.push(attr.value)
          return acc
        case 'ObjectExpression':
          acc.push(
            attr.properties.reduce((h, prop) => {
              if (
                prop.type === 'ObjectProperty' &&
                prop.key &&
                prop.value &&
                PRIMITIVE_TYPES.includes(prop.value.type) &&
                SIMPLE_PROP_KEY_TYPES.includes(prop.key.type) &&
                (!t.isIdentifier(prop.key) || !prop.computed) &&
                !prop.method &&
                !prop.shorthand
              ) {
                h[t.isIdentifier(prop.key) ? prop.key.name : prop.key.value] = prop.value.value
                return h
              }
              info.onRuntime = true
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

  const flattenAttrs = (attrs, flat = []) => {
    attrs.forEach((attr) => {
      if (t.isArrayExpression(attr)) {
        flattenAttrs(attr.elements, flat)
      } else {
        flat.push(attr)
      }
    })
    return flat
  }

  const convertTemplateLiteral = (attr, method, info = { acc: [], change: true }) => {
    let exp
    switch (attr.type) {
      case 'TemplateLiteral':
        exp = attr.expressions.concat(attr.quasis).sort((a, b) => (a.start > b.start ? 1 : -1))
        exp.forEach((e) => convertTemplateLiteral(e, method, info))
        break
      case 'TemplateElement':
        info.acc.push(attr.value.raw)
        break
      case 'StringLiteral':
        info.acc.push(attr.value)
        break
      case 'NumericLiteral':
        info.acc.push(String(attr.value))
        break
      default:
        info.change = false
    }
    return info.change ? t.stringLiteral(info.acc.join('')) : attr
  }

  const convertObjectValues = (attr) => {
    if (attr.type === 'ObjectExpression') {
      attr.properties = attr.properties.map((prop) => {
        if (prop.type === 'ObjectProperty' && prop.key && prop.value && PRIMITIVE_TYPES.includes(prop.value.type)) {
          prop.value = t.numericLiteral(prop.value.value ? 1 : 0)
        }
        return prop
      })
    }
    return attr
  }

  const callCx = (prop, attrs) => {
    attrs = flattenAttrs(attrs)
      .filter((attr) => !t.isNullLiteral(attr))
      .map((attr) => (t.isTemplateLiteral(attr) ? convertTemplateLiteral(attr) : convertObjectValues(attr)))

    const values = extractArgs(attrs)
    if (values.noChange) {
      return null
    }
    if (values.onRuntime) {
      if (attrs.length === 1 && t.isTemplateLiteral(attrs[0]))
        return t.JSXAttribute(t.JSXIdentifier(prop), t.JSXExpressionContainer(attrs[0]))

      flags.used = true
      return t.JSXAttribute(t.JSXIdentifier(prop), t.JSXExpressionContainer(t.CallExpression(cxId, attrs)))
    }
    return t.JSXAttribute(t.JSXIdentifier(prop), t.stringLiteral(cxFunc(values.args)))
  }

  const readAttributes = (path, selectedAttributes) => {
    const info = {}
    selectedAttributes.forEach((prop) => {
      const paths = []
      let attrs = []

      const readAttribute = (name, value, p) => {
        switch (name) {
          case prop:
            if (!value || t.isStringLiteral(value)) return
            if (t.isJSXExpressionContainer(value)) {
              value = value.expression
            }
            if (t.isTemplateLiteral(value)) return
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

  const mutateAttributes = (path, info) => {
    Object.keys(info).forEach((prop) => {
      const attributes = info[prop]
      if (!attributes.attrs.length) return
      const attrValue = callCx(prop, attributes.attrs)
      if (attrValue === null) return
      attributes.paths.forEach((path) => path.remove())
      path.get('openingElement').pushContainer('attributes', attrValue)
    })
  }

  function getOptions(stats) {
    const options = Object.assign(
      {
        dedupe: false,
        attributes: ['className', 'styleName'],
      },
      /* istanbul ignore next */
      stats.opts || {},
    )
    if (!Array.isArray(options.attributes)) options.attributes = [options.attributes]
    return options
  }

  let options;
  let cxId;
  let flags;
  let programPath
  let cxFunc

  return {
    visitor: {
      JSXElement(path) {
        mutateAttributes(path, readAttributes(path, options.attributes))
        if (flags.used && !flags.imported) {
          flags.imported = true;
          programPath.unshiftContainer('body', requireCx(options.dedupe ? 'dedupe' : 'cx'))
        }
      },
      Program(path, stats) {
        programPath = path
        options = getOptions(stats)
        cxId = path.scope.generateUidIdentifier('_cx')
        cxFunc = options.dedupe ? dedupe : cx
        flags = { used: false, imported: false }
      },
    },
    inherits: require('babel-plugin-syntax-jsx'),
  }
}
