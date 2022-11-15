module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['import'],
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  globals: {
    jpeg: true,
    JpegImage: true,
    SharedArrayBuffer: true,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      },
    ],    
    'no-debugger': 'off',
    'accessor-pairs': 'warn',
    'array-bracket-spacing': 'warn',
    'array-callback-return': 'warn',
    'arrow-body-style': 'warn',
    'arrow-spacing': 'warn',
    'block-spacing': 'warn',
    'brace-style': 'warn',
    'callback-return': 'warn',
    'class-methods-use-this': 'warn',
    'comma-spacing': [
      'warn',
      {
        after: true,
        before: false,
      },
    ],
    'comma-style': 'warn',
    complexity: 'warn',
    'computed-property-spacing': 'warn',
    'consistent-this': 'warn',
    curly: 'warn',
    'dot-notation': 'warn',
    'eol-last': 'warn',
    eqeqeq: 'warn',
    'func-call-spacing': 'warn',
    'func-name-matching': 'warn',
    'func-names': ['warn', 'never'],
    'generator-star-spacing': 'warn',
    'global-require': 'warn',
    'handle-callback-err': 'warn',
    'id-blacklist': 'warn',
    'id-length': 'off',
    'id-match': 'warn',
    'import/default': 'warn',
    'import/export': 'warn',
    'import/extensions': ['warn', { js: 'always' }],
    'import/first': 'warn',
    'import/named': 'warn',
    'import/namespace': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-unresolved': 'warn',
    'import/no-webpack-loader-syntax': 'warn',
    'jsx-quotes': 'warn',
    'key-spacing': 'warn',
    'keyword-spacing': [
      'warn',
      {
        after: true,
        before: true,
      },
    ],
    'lines-around-directive': 'warn',
    'max-depth': 'warn',
    'max-nested-callbacks': 'warn',
    'max-statements-per-line': 'warn',
    'multiline-ternary': 'off',
    'new-parens': 'warn',
    'newline-after-var': 'warn',
    'newline-before-return': 'warn',
    'no-alert': 'warn',
    'no-array-constructor': 'warn',
    'no-bitwise': 'warn',
    'no-caller': 'warn',
    'no-catch-shadow': 'warn',
    'no-confusing-arrow': 'warn',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-div-regex': 'warn',
    'no-duplicate-imports': 'warn',
    'no-else-return': 'warn',
    'no-empty-function': 'off',
    'no-eq-null': 'warn',
    'no-eval': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-extra-parens': 'off',
    'no-floating-decimal': 'warn',
    'no-implicit-coercion': 'warn',
    'no-implicit-globals': 'warn',
    'no-implied-eval': 'warn',
    'no-invalid-this': 'off',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': 'warn',
    'no-lone-blocks': 'warn',
    'no-lonely-if': 'warn',
    'no-loop-func': 'warn',
    'no-magic-numbers': 'off',
    'no-mixed-requires': 'warn',
    'no-multi-spaces': 'warn',
    'no-multi-str': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-native-reassign': 'warn',
    'no-negated-condition': 'warn',
    'no-negated-in-lhs': 'warn',
    'no-nested-ternary': 'warn',
    // 'no-new': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-require': 'warn',
    'no-new-wrappers': 'warn',
    'no-octal-escape': 'warn',
    // 'no-param-reassign': 'warn',
    'no-path-concat': 'warn',
    // 'no-plusplus': 'warn',
    'no-process-env': 'warn',
    'no-process-exit': 'warn',
    'no-proto': 'warn',
    // 'no-prototype-builtins': 'warn',
    'no-restricted-globals': 'warn',
    'no-restricted-imports': 'warn',
    'no-restricted-modules': 'warn',
    'no-restricted-properties': 'warn',
    'no-restricted-syntax': 'warn',
    'no-return-assign': 'warn',
    'no-return-await': 'warn',
    'no-script-url': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    // 'no-shadow': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-spaced-func': 'warn',
    'no-sync': 'warn',
    'no-tabs': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-ternary': 'off',
    'no-throw-literal': 'warn',
    'no-trailing-spaces': 'warn',
    'no-undef': 'error',
    'no-undef-init': 'warn',
    'no-undefined': 'off',
    'no-unused-vars': 'warn',
    // 'no-underscore-dangle': 'warn',
    'no-unmodified-loop-condition': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-unused-expressions': 'warn',
    // 'no-use-before-define': 'warn',
    'no-useless-call': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': 'warn',
    'no-useless-return': 'off',
    'no-var': 'warn',
    'no-void': 'warn',
    // 'no-warning-comments': 'warn',
    'no-whitespace-before-property': 'warn',
    'no-with': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'object-property-newline': 'warn',
    'object-shorthand': 'warn',
    'one-var': 'off',
    'one-var-declaration-per-line': 'warn',
    'operator-assignment': 'warn',
    'operator-linebreak': 'warn',
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-const': 'warn',
    'prefer-numeric-literals': 'warn',
    // 'prefer-reflect': 'warn',
    // 'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'quote-props': ['warn', 'as-needed'],
    quotes: ['warn', 'single'],
    radix: 'warn',
    'require-await': 'off',
    // 'require-jsdoc': 'warn',
    'rest-spread-spacing': 'warn',
    semi: 'warn',
    'semi-spacing': 'warn',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'sort-vars': 'off',
    'space-before-blocks': 'warn',
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': 'warn',
    'space-unary-ops': 'warn',
    'spaced-comment': 'off',
    strict: 'warn',
    'symbol-description': 'warn',
    'template-curly-spacing': 'warn',
    'unicode-bom': ['warn', 'never'],
    // 'valid-jsdoc': 'warn',
    'vars-on-top': 'warn',
    'wrap-iife': ['warn', 'inside'],
    'wrap-regex': 'warn',
    'yield-star-spacing': 'warn',
    yoda: 'warn',
  },
};
