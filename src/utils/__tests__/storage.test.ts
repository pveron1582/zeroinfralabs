// ── utils/__tests__/storage.test.ts ──────────────────────────────
// El reset del lab de pruebas usaba localStorage.clear(), que borraba TODO el origen
// (progreso de Academy, tema, idioma…). Estos tests fijan que solo toque lo nuestro.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clearZilabsStorage, LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from '../storage';

describe('clearZilabsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('debe borrar solo las claves de ZI Labs y respetar las del resto del origen', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.store, JSON.stringify({ state: { completedLessons: ['linux-01'] } }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.wallpaper, 'wall-2');
    localStorage.setItem('otra-app-token', 'no-tocar');
    sessionStorage.setItem(SESSION_STORAGE_KEYS.sessionId, 'sess_abc');
    sessionStorage.setItem(SESSION_STORAGE_KEYS.foxyTour, '1');

    clearZilabsStorage();

    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.store)).toBeNull();
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.wallpaper)).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.sessionId)).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.foxyTour)).toBeNull();
    expect(localStorage.getItem('otra-app-token')).toBe('no-tocar');
  });

  it('no debe tocar el progreso de Academy de otras claves', () => {
    const academyProgress = JSON.stringify({ state: { completedLessons: ['linux-01', 'redes-02'] } });
    localStorage.setItem('otra-clave-de-progreso', academyProgress);

    clearZilabsStorage();

    expect(localStorage.getItem('otra-clave-de-progreso')).toBe(academyProgress);
  });

  it('no debe lanzar si el storage está bloqueado (modo privado)', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage bloqueado');
    });

    expect(() => clearZilabsStorage()).not.toThrow();

    spy.mockRestore();
  });
});