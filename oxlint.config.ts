import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  plugins: ['eslint', 'typescript', 'react', 'jsx-a11y', 'import', 'vitest'],
  ignorePatterns: ['scripts', 'extractor.ts'],
  jsPlugins: ['eslint-plugin-sonarjs'],
  rules: {
    'eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'vitest/require-mock-type-parameters': 'off',
  },
});
