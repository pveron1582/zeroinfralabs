// ── frameworks/packages/__tests__/packageManager.test.ts ───────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO del framework de paquetes. Antes solo se llegaba por rebote
// desde `fase7-packages-pipes-env.test.ts` (los comandos apt/dpkg), y las
// dos guardas de PACKAGE_DB (install/remove de un paquete inexistente)
// quedaban sin ejecutar.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PACKAGE_DB, getPackage, searchPackages,
  listInstalled, isInstalled, installPackage, removePackage, resetPackageManager,
} from '../packageManager';
import type { Machine } from '../../../types';

const machine = { id: 'target-01' } as Machine;

beforeEach(() => resetPackageManager());

describe('PACKAGE_DB', () => {
  it('getPackage devuelve la ficha solo para paquetes conocidos', () => {
    expect(getPackage('nmap')?.name).toBe('nmap');
    expect(getPackage('paquete-inexistente')).toBeUndefined();
  });

  it('searchPackages filtra por término (nombre o descripción)', () => {
    const hits = searchPackages('network');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every(p => p.name.includes('network') || p.description.toLowerCase().includes('network'))).toBe(true);
    expect(searchPackages('zzz-nada')).toEqual([]);
  });
});

describe('installPackage / removePackage', () => {
  it('instala un paquete conocido y queda listado', () => {
    expect(installPackage(machine, 'nmap')).toBe(true);
    expect(isInstalled(machine, 'nmap')).toBe(true);
    expect(listInstalled(machine).map(p => p.name)).toContain('nmap');
  });

  it('la lista instalada sale ordenada alfabéticamente', () => {
    installPackage(machine, 'nmap');
    installPackage(machine, 'curl');
    installPackage(machine, 'bash');
    const names = listInstalled(machine).map(p => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names).toEqual(['bash', 'curl', 'nmap']);
  });

  it('instalar un paquete inexistente falla y no lo agrega', () => {
    expect(installPackage(machine, 'paquete-inexistente')).toBe(false);
    expect(isInstalled(machine, 'paquete-inexistentee')).toBe(false);
    expect(listInstalled(machine)).toEqual([]);
  });

  it('quitar un paquete inexistente falla y no toca la lista', () => {
    installPackage(machine, 'nmap');
    expect(removePackage(machine, 'paquete-inexistente')).toBe(false);
    expect(isInstalled(machine, 'nmap')).toBe(true);
    expect(listInstalled(machine)).toHaveLength(1);
  });

  it('quitar un paquete conocido lo desinstala', () => {
    installPackage(machine, 'nmap');
    expect(removePackage(machine, 'nmap')).toBe(true);
    expect(isInstalled(machine, 'nmap')).toBe(false);
    expect(listInstalled(machine)).toEqual([]);
  });

  it('el estado es por máquina: instalar en una no instala en la otra', () => {
    const otra = { id: 'target-02' } as Machine;
    installPackage(machine, 'nmap');
    expect(isInstalled(otra, 'nmap')).toBe(false);
    expect(listInstalled(otra)).toEqual([]);
  });

  it('resetPackageManager limpia todas las máquinas', () => {
    installPackage(machine, 'nmap');
    resetPackageManager();
    expect(isInstalled(machine, 'nmap')).toBe(false);
    expect(listInstalled(machine)).toEqual([]);
  });

  it('todos los paquetes del catálogo tienen ficha coherente', () => {
    for (const [key, info] of Object.entries(PACKAGE_DB)) {
      expect(info.name, `clave "${key}"`).toBeTruthy();
      expect(info.description, `clave "${key}"`).toBeTruthy();
      expect(getPackage(key)).toBe(info);
    }
  });
});
