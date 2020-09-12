module.exports = {
  extends: ['eslint:recommended', 'eslint-config-prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
  },
}
