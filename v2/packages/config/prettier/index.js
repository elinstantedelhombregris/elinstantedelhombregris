/**
 * Shared Prettier configuration.
 * Tailwind plugin sorts class names; trailing-comma-all matches modern JS/TS.
 */
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
};
