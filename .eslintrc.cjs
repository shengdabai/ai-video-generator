module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/', 'dist/', '.omc/'],
  overrides: [{
    files: ['*.ts', '*.tsx'],
    rules: {
      // TypeScript checks names; the core rules mistake type declarations for values.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
    },
  }],
};
