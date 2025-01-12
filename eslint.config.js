module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: true,
    },
    extends: [
      "plugin:vue/vue3-recommended",
      "eslint:recommended"
    ],
    rules: {
      "vue/no-unused-refs": "warn",
      "vue/no-unused-vars": "warn",
      "vue/multi-word-component-names": "warn"
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['node_modules'],
        },
      },
    },
  }
  