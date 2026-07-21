import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Con `globals: false`, testing-library no puede registrar su auto-cleanup;
// sin esto el DOM se acumula entre `it` y los queries encuentran duplicados.
afterEach(() => {
  cleanup();
});
