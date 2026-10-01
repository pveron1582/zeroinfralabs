// ── store/__tests__/persistMigrate.test.ts ───────────────────────
// Contrato de la migración del snapshot persistido (ver
// store/persistMigrate.ts). Cubre lo que zustand hace cuando `version` del
// storage no coincide con la del store: sin `migrate` descarta todo.

import { describe, it, expect } from 'vitest';
import {
  PERSIST_VERSION,
  PERSIST_KEYS,
  migratePersistedState,
  type MigrationMap,
} from '../persistMigrate';
import { persistPartialize, useScenarioStore } from '../scenarioStore';

describe('migratePersistedState', () => {
  it('conserva sólo las claves persistidas y tira el resto', () => {
    const out = migratePersistedState(
      { language: 'en', theme: 'dark', claveQueYaNoExiste: 'basura', msfState: { x: 1 } },
      2
    );
    expect(out).toEqual({ language: 'en', theme: 'dark' });
    for (const key of Object.keys(out)) expect(PERSIST_KEYS).toContain(key);
  });

  it('devuelve un snapshot vacío si no había nada guardado', () => {
    expect(migratePersistedState(undefined, 2)).toEqual({});
    expect(migratePersistedState(null, 2)).toEqual({});
    expect(migratePersistedState('texto', 2)).toEqual({});
    expect(migratePersistedState(42, 2)).toEqual({});
  });

  it('aplica las migraciones de atrás para adelante, en orden de versión', () => {
    const migrations: MigrationMap = {
      1: s => ({ ...s, termColor: '#00ff00' }),
      // la 2 lee lo que dejó la 1: si el orden fuera otro, quedaría 'light'
      2: s => ({ ...s, theme: s.termColor === '#00ff00' ? 'dark' : 'light' }),
    };
    const out = migratePersistedState({ language: 'es' }, 0, migrations);
    expect(out).toEqual({ language: 'es', termColor: '#00ff00', theme: 'dark' });
  });

  it('no corre migraciones de versiones ya superadas por el snapshot', () => {
    const out = migratePersistedState(
      { language: 'es' },
      PERSIST_VERSION,
      { 3: s => ({ ...s, theme: 'dark' }) }
    );
    expect(out).toEqual({ language: 'es' });
  });

  it('no muta el objeto que recibe', () => {
    const guardado = { language: 'es', basura: 1 };
    migratePersistedState(guardado, 2);
    expect(guardado).toEqual({ language: 'es', basura: 1 });
  });
});

describe('contrato de la versión persistida', () => {
  it('partialize y PERSIST_KEYS declaran exactamente las mismas claves', () => {
    // Si alguien agrega una clave a `partialize` sin sumarla a PERSIST_KEYS,
    // el filtro de migrate la tiraría en cada salto de versión; si la suma a
    // PERSIST_KEYS sin persistirla, el recorte es inocuo pero engaña.
    const snapshot = persistPartialize(useScenarioStore.getState());
    expect(Object.keys(snapshot).sort()).toEqual([...PERSIST_KEYS].sort());
  });

  it('PERSIST_KEYS y PERSIST_VERSION son el mapa que hay que tocar al subir versión', () => {
    // Tripwire a propósito: subir PERSIST_VERSION o agregar una clave
    // persistida obliga a revisar este archivo (y el registro MIGRATIONS).
    expect(PERSIST_VERSION).toBe(2);
    expect(PERSIST_KEYS.length).toBe(7);
  });
});
