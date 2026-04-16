module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Catch real bugs
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',

    // Warn on bad practices
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' }],

    // React hooks correctness
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Keep code clean
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'warn',
  },
};
