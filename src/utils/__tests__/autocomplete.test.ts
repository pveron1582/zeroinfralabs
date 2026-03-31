// ── utils/__tests__/autocomplete.test.ts ──────────────────────────
// Tests para el sistema de autocompletado de la terminal
// Verifica que las funciones de autocompletado funcionen correctamente
// para comandos, archivos y directorios

import { describe, it, expect } from 'vitest';
import {
  autocompleteCommand,
  autocompleteFile,
  getAutocompleteSuggestions,
  findCommonPrefix,
  autocompleteMsf,
} from '../autocomplete';
import type { Machine } from '../../types';

// Helper para crear una máquina virtual de prueba
// Permite simular diferentes sistemas de archivos para los tests
const createMachine = (files: Array<{ path: string; content: string; type: 'text' }>): Machine => ({
  id: 'test-machine',
  machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files,
});

// Tests para autocompletado de comandos
// Verifica que la función filtre correctamente los comandos disponibles
describe('autocompleteCommand', () => {
  it('debe retornar todos los comandos si no hay prefijo', () => {
    const result = autocompleteCommand('');
    expect(result).toContain('help');
    expect(result).toContain('ls');
    expect(result).toContain('cat');
    expect(result).toContain('cd');
    expect(result).toContain('nmap');
    expect(result).toContain('ssh');
    expect(result.length).toBeGreaterThan(10);
  });

  it('debe filtrar comandos por prefijo', () => {
    const result = autocompleteCommand('n');
    expect(result).toContain('nmap');
    expect(result).not.toContain('help');
    expect(result).not.toContain('ls');
  });

  it('debe filtrar comandos por prefijo parcial', () => {
    const result = autocompleteCommand('nm');
    expect(result).toContain('nmap');
    expect(result.length).toBe(1);
  });

  it('debe retornar array vacío si no hay coincidencias', () => {
    const result = autocompleteCommand('xyz');
    expect(result).toEqual([]);
  });

  it('debe ser case-insensitive', () => {
    const result = autocompleteCommand('N');
    expect(result).toContain('nmap');
  });

  it('debe encontrar comandos que empiezan con "s"', () => {
    const result = autocompleteCommand('s');
    expect(result).toContain('sudo');
    expect(result).toContain('ssh');
  });

  it('debe encontrar comandos que empiezan con "c"', () => {
    const result = autocompleteCommand('c');
    expect(result).toContain('cat');
    expect(result).toContain('cd');
    expect(result).toContain('clear');
  });
});

// Tests para autocompletado de archivos y directorios
// Verifica que la función encuentre correctamente archivos en el sistema de archivos
describe('autocompleteFile', () => {
  it('debe retornar archivos en directorio raíz', () => {
    const machine = createMachine([
      { path: '/etc/.dir', content: '', type: 'text' },
      { path: '/var/.dir', content: '', type: 'text' },
      { path: '/home/.dir', content: '', type: 'text' },
    ]);
    const result = autocompleteFile('', machine, '/');
    expect(result).toContain('etc/');
    expect(result).toContain('var/');
    expect(result).toContain('home/');
  });

  it('debe filtrar archivos por prefijo', () => {
    const machine = createMachine([
      { path: '/etc/passwd', content: 'test', type: 'text' },
      { path: '/etc/shadow', content: 'test', type: 'text' },
      { path: '/etc/hostname', content: 'test', type: 'text' },
    ]);
    const result = autocompleteFile('pa', machine, '/etc/');
    expect(result).toContain('passwd');
    expect(result).not.toContain('shadow');
    expect(result).not.toContain('hostname');
  });

  it('debe retornar archivos en subdirectorio', () => {
    const machine = createMachine([
      { path: '/var/log/syslog', content: 'test', type: 'text' },
      { path: '/var/log/auth.log', content: 'test', type: 'text' },
    ]);
    const result = autocompleteFile('', machine, '/var/log/');
    expect(result).toContain('syslog');
    expect(result).toContain('auth.log');
  });

  it('debe manejar paths absolutos', () => {
    const machine = createMachine([
      { path: '/etc/passwd', content: 'test', type: 'text' },
      { path: '/etc/shadow', content: 'test', type: 'text' },
    ]);
    const result = autocompleteFile('/etc/pa', machine, '/');
    expect(result).toContain('/etc/passwd');
  });

  it('debe retornar array vacío si no hay coincidencias', () => {
    const machine = createMachine([
      { path: '/etc/passwd', content: 'test', type: 'text' },
    ]);
    const result = autocompleteFile('xyz', machine, '/etc/');
    expect(result).toEqual([]);
  });

  it('debe retornar array vacío si no hay archivos', () => {
    const machine = createMachine([]);
    const result = autocompleteFile('', machine, '/');
    expect(result).toEqual([]);
  });
});

// Tests para la función principal de autocompletado
// Verifica que determine correctamente si autocompletar comando o archivo
describe('getAutocompleteSuggestions', () => {
  it('debe autocompletar comando cuando es la primera palabra', () => {
    const machine = createMachine([]);
    const result = getAutocompleteSuggestions('nm', 2, machine, '/');
    expect(result.suggestions).toContain('nmap');
    expect(result.replaceStart).toBe(0);
    expect(result.replaceEnd).toBe(2);
  });

  it('debe autocompletar archivo cuando hay un espacio', () => {
    const machine = createMachine([
      { path: '/etc/passwd', content: 'test', type: 'text' },
    ]);
    const result = getAutocompleteSuggestions('cat /etc/pa', 11, machine, '/');
    expect(result.suggestions).toContain('/etc/passwd');
    expect(result.replaceStart).toBe(4);
  });

  it('debe completar automáticamente con una sola sugerencia', () => {
    const machine = createMachine([]);
    const result = getAutocompleteSuggestions('nma', 3, machine, '/');
    expect(result.completedText).toBe('nmap');
  });

  it('debe retornar múltiples sugerencias sin completar', () => {
    const machine = createMachine([]);
    const result = getAutocompleteSuggestions('s', 1, machine, '/');
    expect(result.suggestions.length).toBeGreaterThan(1);
    expect(result.completedText).toBe('s');
  });

  it('debe manejar input vacío', () => {
    const machine = createMachine([]);
    const result = getAutocompleteSuggestions('', 0, machine, '/');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('debe autocompletar comando completo', () => {
    const machine = createMachine([]);
    const result = getAutocompleteSuggestions('hel', 3, machine, '/');
    expect(result.suggestions).toContain('help');
    expect(result.completedText).toBe('help');
  });
});

// Tests para encontrar prefijo común entre sugerencias
// Verifica que la función encuentre el prefijo más largo compartido
describe('findCommonPrefix', () => {
  it('debe encontrar prefijo común entre sugerencias', () => {
    const result = findCommonPrefix(['nano', 'name', 'narrow']);
    expect(result).toBe('na');
  });

  it('debe retornar cadena vacía si no hay prefijo común', () => {
    const result = findCommonPrefix(['abc', 'xyz', 'def']);
    expect(result).toBe('');
  });

  it('debe retornar la cadena completa si solo hay una sugerencia', () => {
    const result = findCommonPrefix(['nmap']);
    expect(result).toBe('nmap');
  });

  it('debe retornar cadena vacía si no hay sugerencias', () => {
    const result = findCommonPrefix([]);
    expect(result).toBe('');
  });

  it('debe encontrar prefijo común con strings similares', () => {
    const result = findCommonPrefix(['cat', 'cd', 'clear']);
    expect(result).toBe('c');
  });

  it('debe encontrar prefijo común con strings idénticos', () => {
    const result = findCommonPrefix(['test', 'test', 'test']);
    expect(result).toBe('test');
  });
});

// Tests para autocompletado de Metasploit
describe('autocompleteMsf', () => {
  it('debe autocompletar comandos MSF como primera palabra', () => {
    const result = autocompleteMsf('se', 'se', true);
    expect(result).toContain('set');
    expect(result).toContain('search');
  });

  it('debe autocompletar opciones de use (módulos)', () => {
    const result = autocompleteMsf('auxiliary/', 'use auxiliary/', false);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain('auxiliary/');
  });

  it('debe autocompletar opciones de set', () => {
    const result = autocompleteMsf('RH', 'set RH', false);
    expect(result).toContain('RHOSTS');
    // RPORT no empieza con 'RH', así que solo esperamos RHOSTS
  });

  it('debe autocompletar opciones de show', () => {
    const result = autocompleteMsf('opt', 'show opt', false);
    expect(result).toContain('options');
  });

  it('debe retornar array vacío para comandos desconocidos', () => {
    const result = autocompleteMsf('foo', 'foo', false);
    expect(result).toEqual([]);
  });
});