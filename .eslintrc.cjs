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
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
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
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  overrides: [
    {
      // TypeScript files in src (with project references)
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        // TypeScript-specific rules for src files
      },
    },
    {
      // Config files (vite.config.ts, etc.) - without project references
      files: ['*.config.ts', 'vite.config.ts', '*.config.js'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      }
    },
    {
      // Node.js script files (CommonJS)
      files: ['scripts/**/*.js', 'scripts/**/*.cjs', '*.js', '*.cjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'script',
      },
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      }
    }
  ],
};
