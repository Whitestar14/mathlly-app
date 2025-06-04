module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // Vue specific rules
    'vue/no-unused-refs': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/component-options-name-casing': 'warn',
    'vue/component-tags-order': 'warn',
    'vue/define-macros-order': 'warn',
    'vue/no-dupe-keys': 'warn',
    'vue/no-required-prop-with-default': 'warn',
    'vue/no-undef-components': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/no-unused-properties': 'warn',
    'vue/multi-word-component-names': 'off',
    
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off', // Turn off during migration
    '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore during migration
    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
