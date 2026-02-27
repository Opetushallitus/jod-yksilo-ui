import eslint from '@eslint/js';
import singlestoreReactHooksDisableImport from '@singlestore/eslint-plugin-react-hooks-disable-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
  },
  {
    ignores: [
      '**/dist',
      '**/eslint.config.js',
      'src/api/schema.d.ts',
      '**/coverage',
      './playwright-report',
      'scripts/**',
    ],
  },

  eslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  sonarjs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      '@singlestore/react-hooks-disable-import': singlestoreReactHooksDisableImport,
      react: react,
      'react-hooks': hooksPlugin,
      'react-refresh': reactRefresh,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      'no-useless-rename': 'error',
      'no-console': 'warn',
      'react/jsx-child-element-spacing': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-vars': [
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
      '@singlestore/react-hooks-disable-import/react-hooks-disable-import': 'error',
      'sonarjs/new-cap': 'off',
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/mouse-events-a11y': 'off', // this is also checked by the jsx-a11y
      'react/no-unstable-nested-components': 'warn',
      'react/no-array-index-key': 'warn',
      'sonarjs/slow-regex': 'error',
      'sonarjs/no-misused-promises': 'off',
      ...hooksPlugin.configs.recommended.rules,
    },
  },
  // Do not allow process.env in client code, as it is not replaced by Vite and will cause errors in the browser. Use import.meta.env instead.
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use import.meta.env in Vite client code instead of process.env.',
        },
      ],
    },
  },
  // Allow process.env in config and scripts files
  {
    files: ['vite.config.*', 'vitest.config.*', 'playwright.config.*', 'scripts/**/*'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  eslintConfigPrettier, // must be last, override other configs
];
