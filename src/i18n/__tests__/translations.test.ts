// ── i18n/__tests__/translations.test.ts ────────────────────────────
// Cubre las ramas de fallback de useT (idioma inválido → en, clave
// faltante → key) y la función legacy t() (40% branch antes de este test).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useT, useLanguage, t } from '../translations';

const storeRef = vi.hoisted(() => ({ current: { language: 'es' as string } }));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: any) => selector(storeRef.current)),
    { getState: vi.fn(() => storeRef.current), setState: vi.fn() }
  ),
}));

describe('i18n/translations', () => {
  beforeEach(() => { storeRef.current = { language: 'es' }; });

  it('useLanguage refleja el idioma del store', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe('es');
  });

  it('useT traduce en español', () => {
    storeRef.current = { language: 'es' };
    const { result } = renderHook(() => useT());
    expect(result.current('close')).toBe('Cerrar');
  });

  it('useT cae a inglés si el idioma es inválido', () => {
    storeRef.current = { language: 'xx' };
    const { result } = renderHook(() => useT());
    expect(result.current('close')).toBe('Close');
  });

  it('useT cae a la clave si no existe la traducción', () => {
    storeRef.current = { language: 'es' };
    const { result } = renderHook(() => useT());
    expect(result.current('clave-inexistente' as any)).toBe('clave-inexistente');
  });

  it('t() legacy siempre devuelve inglés', () => {
    expect(t('close')).toBe('Close');
  });
});
