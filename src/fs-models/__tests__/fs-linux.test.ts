// ── fs-models/__tests__/fs-linux.test.ts ─────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Plantilla Linux neutra: sin hostname ni narrativa de laboratorio, y bits
// especiales (SUID/sticky) acotados a lo que trae un Ubuntu de fábrica.

import { describe, it, expect } from 'vitest';
import { createLinuxFileSystem } from '../fs-linux';
import { MACHINE_HOSTNAME_PLACEHOLDER } from '../placeholders';
import { hasSuid, hasStickyBit } from '../../utils/permissions';

describe('createLinuxFileSystem (plantilla neutra)', () => {
  it('debe usar el placeholder de hostname en /etc/hostname y /etc/hosts', () => {
    const files = createLinuxFileSystem();

    const hostname = files.find(f => f.path === '/etc/hostname');
    expect(hostname?.content).toBe(MACHINE_HOSTNAME_PLACEHOLDER);

    const hosts = files.find(f => f.path === '/etc/hosts');
    expect(hosts?.content).toContain(`127.0.1.1\t${MACHINE_HOSTNAME_PLACEHOLDER}`);
    expect(hosts?.content).not.toContain('target-server');
  });

  it('debe dejar los logs sin hostname ni narrativa de laboratorio', () => {
    const all = createLinuxFileSystem().map(f => f.content).join('\n');

    expect(all).not.toContain('target-server');
    expect(all).not.toContain('192.168.1.100');
    // Sesión inyectada: usuario admin entrando por ssh desde el atacante.
    expect(all).not.toContain('Accepted password for admin');
    expect(all).not.toContain('COMMAND=/bin/bash');
    // Motd sin "Last login from" (la IP era del escenario)
    expect(all).not.toContain('Last login');
  });

  it('debe dejar fuera flags y credenciales de laboratorio', () => {
    const all = createLinuxFileSystem().map(f => f.content).join('\n');

    expect(all).not.toContain('THM{');
    expect(all).not.toContain('ZIL{');
    expect(all).not.toContain('P@ssw0rd123!');
    expect(createLinuxFileSystem().some(f => /flag\.txt/.test(f.path))).toBe(false);
  });

  it('SUID solo en su/sudo/passwd: find y vim quedan en 755', () => {
    const files = createLinuxFileSystem();
    const suid = files.filter(f => hasSuid(f.mode ?? 0o755)).map(f => f.path).sort();

    expect(suid).toEqual(['/usr/bin/passwd', '/usr/bin/su', '/usr/bin/sudo']);
    // Con 4755 el executor marcaba privescCompleted en cualquier `find`/`vim`
    // de cualquier lab (atajo que completaba la misión de privesc).
    expect(files.find(f => f.path === '/usr/bin/find')?.mode).toBe(0o755);
    expect(files.find(f => f.path === '/usr/bin/vim')?.mode).toBe(0o755);
    expect(files.find(f => f.path === '/usr/bin/sudo')?.mode).toBe(0o4755);
  });

  it('debe dejar el webroot sin .htaccess de WordPress', () => {
    const files = createLinuxFileSystem();

    expect(files.some(f => f.path === '/var/www/html/.htaccess')).toBe(false);
    expect(files.some(f => f.content.includes('RewriteRule'))).toBe(false);
    // El index por defecto de Apache sí se mantiene (viene del paquete)
    expect(files.some(f => f.path === '/var/www/html/index.html')).toBe(true);
  });

  it('debe conservar sticky bit en /tmp', () => {
    const tmp = createLinuxFileSystem().find(f => f.path === '/tmp/.dir');
    expect(tmp).toBeDefined();
    expect(hasStickyBit(tmp?.mode ?? 0)).toBe(true);
  });
});
