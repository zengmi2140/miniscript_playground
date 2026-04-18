import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import React from 'react';

// Vitest + classic JSX in some modules expect `React` in scope for transformed JSX
(globalThis as unknown as { React: typeof React }).React = React;

beforeEach(() => {
  try {
    localStorage.removeItem('scriptwise-locale');
  } catch {}
});
