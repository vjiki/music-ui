import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Set up localStorage mock for Node.js environment
(globalThis as any).localStorage = localStorageMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

