module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Error prevention
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'warn',
    
    // Style consistency
    'indent': ['warn', 2],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'only-multiline'],
    'arrow-spacing': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    
    // Best practices
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-return-await': 'warn',
    'require-await': 'warn',
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'warn',
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};