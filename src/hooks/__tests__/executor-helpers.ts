// ── hooks/__tests__/executor-helpers.ts ────────────────────────────
// Fábrica de mocks de IsolatedExecutor: completa el contrato (executeCommand
// + los métodos MSF/PS) para que los tests de hooks type-checkeen contra la
// interfaz real devuelta por createIsolatedExecutor().

import { vi } from 'vitest';
import type { IsolatedExecutor } from '../../commands';

/** Crea un mock completo y comprobado contra el contrato del executor. */
export function createMockExecutor(
  executeCommand: IsolatedExecutor['executeCommand'] = vi.fn(() => ({ output: 'ok' })),
): IsolatedExecutor {
  return {
    executeCommand,
    isMsfActive: vi.fn(() => false),
    getMsfPrompt: vi.fn(() => null),
    getMsfState: vi.fn(() => null),
    resetMsfState: vi.fn(),
    getMsfStateSnapshot: vi.fn(() => null),
    isPsActive: vi.fn(() => false),
    getPsState: vi.fn(() => null),
    resetPsState: vi.fn(),
  };
}
