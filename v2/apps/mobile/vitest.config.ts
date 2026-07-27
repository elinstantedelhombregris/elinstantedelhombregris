import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: [
      'src/game/**/*.test.ts',
      'src/content/**/*.test.ts',
      'src/cielo/**/*.test.ts',
      'src/civic/**/*.test.ts',
      'src/protocolo/**/*.test.ts',
      'src/components/**/*.test.ts',
    ],
  },
});
