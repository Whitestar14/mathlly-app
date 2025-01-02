module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
    ],
    settings: {
      'import/resolver': {
        node: {
          paths: ['node_modules'],
        },
      },
    },
  };
  