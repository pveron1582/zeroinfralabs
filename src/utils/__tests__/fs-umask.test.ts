// ── utils/__tests__/fs-umask.test.ts ──────────────────────────────
// applyUmask es una regla de permisos que vive en utils/fs (la usan 23
// call sites de utils, frameworks y commands; antes vivía en el comando
// `umask`, y eso obligaba a los frameworks a importar un comando).

import { describe, it, expect } from 'vitest';
import { applyUmask, DEFAULT_UMASK } from '../fs';


describe('applyUmask', () => {
  it('debe calcular mode efectivo correctamente', () => {
    expect(applyUmask(0o666, 0o022)).toBe(0o644);
    expect(applyUmask(0o777, 0o022)).toBe(0o755);
  });

  it('debe calcular con umask 077', () => {
    expect(applyUmask(0o666, 0o077)).toBe(0o600);
    expect(applyUmask(0o777, 0o077)).toBe(0o700);
  });

  it('debe usar 022 por defecto si no se pasa umask', () => {
    expect(applyUmask(0o666)).toBe(0o644);
  });
});

describe('DEFAULT_UMASK', () => {
  it('es 022 y se usa cuando el comando no passes máscara', () => {
    expect(DEFAULT_UMASK).toBe(0o022);
    expect(applyUmask(0o666)).toBe(0o644);
  });
});
