// @ts-check
import tseslint from 'typescript-eslint';
import globals from 'globals';

import baseConfig from './index.js';

/** ESLint config for Node.js (backend) packages. */
export default tseslint.config(...baseConfig, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    'no-process-exit': 'off',
  },
});
