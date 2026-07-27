// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Scripts de build/generación de assets: corren en Node, no en la app.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // Reanimated SharedValue mutations happen on the UI-thread worklet and
    // are the library's supported API, not React state mutation.
    files: ['src/app/index.tsx', 'src/app/rito.tsx', 'src/cielo/CieloCanvas.tsx'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  {
    // Unlock detection synchronizes the append-only ledger with its reveal UI.
    files: ['src/app/album.tsx'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
]);
