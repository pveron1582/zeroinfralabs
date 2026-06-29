// ── i18n/__tests__/translations.test.ts ────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { t, translations, useLanguage, useSetLanguage, useT } from '../translations';
import { useScenarioStore } from '../../store/scenarioStore';

describe('i18n - función t() y datos', () => {
  it('debe devolver traducción en inglés por defecto', () => {
    expect(t('title')).toBe('ZeroInfra Labs');
    expect(t('startButton')).toBe('START');
    expect(t('easy')).toBe('Easy');
    expect(t('medium')).toBe('Medium');
    expect(t('hard')).toBe('Hard');
  });

  it('translations debe tener las mismas claves en inglés y español', () => {
    const enKeys = Object.keys(translations.en).sort();
    const esKeys = Object.keys(translations.es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('todas las traducciones en inglés deben tener valores no vacíos', () => {
    for (const key of Object.keys(translations.en)) {
      expect(translations.en[key as keyof typeof translations.en]).toBeTruthy();
    }
  });

  it('todas las traducciones en español deben tener valores no vacíos', () => {
    for (const key of Object.keys(translations.es)) {
      expect(translations.es[key as keyof typeof translations.es]).toBeTruthy();
    }
  });

  it('debe tener traducciones específicas en español', () => {
    expect(translations.es.title).toBe('ZeroInfra Labs');
    expect(translations.es.startButton).toBe('INICIAR');
    expect(translations.es.easy).toBe('Fácil');
    expect(translations.es.medium).toBe('Medio');
    expect(translations.es.hard).toBe('Difícil');
  });
});

describe('i18n - hooks', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'en' });
  });

  it('useLanguage devuelve el idioma del store', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe('en');
  });

  it('useSetLanguage cambia el idioma en el store', () => {
    const { result } = renderHook(() => useSetLanguage());
    result.current('es');
    const lang = useScenarioStore.getState().language;
    expect(lang).toBe('es');
  });

  it('useT devuelve función que traduce según el idioma actual', () => {
    const { result, rerender } = renderHook(() => useT());
    expect(result.current('title')).toBe('ZeroInfra Labs');
    expect(result.current('startButton')).toBe('START');

    useScenarioStore.setState({ language: 'es' });
    rerender();
    expect(result.current('title')).toBe('ZeroInfra Labs');
    expect(result.current('startButton')).toBe('INICIAR');
  });
});