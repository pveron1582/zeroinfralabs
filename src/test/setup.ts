// ── src/test/setup.ts ─────────────────────────────────────────────
// Setup file for Vitest tests
// Configures jest-dom matchers and other test utilities

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.history
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    pushState: vi.fn(),
    back: vi.fn(),
    state: null,
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Cleanup after each test
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, afterAll } from 'vitest';
import { useScenarioStore } from '../store/scenarioStore';

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  // Reset store to default values using setState
  useScenarioStore.setState((state) => ({
    ...state,
    view: 'landing',
    browserCurrentUrl: 'https://www.google.com',
    browserIsLoggedIn: false,
    browserNavHistory: ['https://www.google.com'],
    browserNavIdx: 0,
  }), true);
});

afterEach(() => {
  cleanup();
});
