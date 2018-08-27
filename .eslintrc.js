// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'semi': ["error", "always", { "omitLastInOneLineBlock": true}]
    "indent": ["error", "tab"],
    "no-tabs": 0,
    "comma-dangle": ["error", "only-multiline"],
    "brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
    "spaced-comment": 0,
    "quotes": 0,
    "no-trailing-spaces": ["error", { "skipBlankLines": true }],
    "space-before-function-paren": ["error", "never"],
  }
}
