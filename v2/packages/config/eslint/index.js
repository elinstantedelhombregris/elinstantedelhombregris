// @ts-check
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Base ESLint configuration shared across all workspaces.
 * Strict TypeScript rules + import ordering + Prettier compatibility.
 *
 * Apps extend this with environment-specific configs:
 *   - `./node.js` for backend / scripts
 *   - `./react.js` for frontend
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', '.turbo/**', '*.config.js', '*.config.ts'],
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.es2022,
      },
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Type safety — non-negotiable
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: false },
      ],

      // Console / debugging — use the logger
      'no-console': 'error',

      // Imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'off',
      'import/no-duplicates': 'error',

      // General hygiene
      'no-debugger': 'error',
      'no-alert': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  prettierConfig,
);
