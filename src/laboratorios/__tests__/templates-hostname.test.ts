// ── laboratorios/__tests__/templates-hostname.test.ts ────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// buildScenario inyecta el hostname real de cada máquina (fuente única:
// machine_info.hostname) en los archivos de la plantilla Linux.

import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '../laboratorios';
import { MACHINE_HOSTNAME_PLACEHOLDER } from '../../fs-models';
import type { Machine } from '../../types';

/** Máquinas Linux de todos los labs (targets + atacantes Kali). */
function linuxMachines(): Machine[] {
  return SCENARIOS
    .flatMap(s => s.machines)
    .filter(m => m.machine_info.family !== 'windows');
}

describe('hostname por máquina (placeholder reemplazado en buildScenario)', () => {
  it('ningún archivo conserva el placeholder MACHINE_HOSTNAME', () => {
    for (const m of linuxMachines()) {
      const leftovers = (m.files ?? [])
        .filter(f => f.content.includes(MACHINE_HOSTNAME_PLACEHOLDER))
        .map(f => f.path);
      expect(leftovers, `${m.id} conserva el placeholder`).toEqual([]);
    }
  });

  it('/etc/hostname coincide con machine_info.hostname en cada máquina Linux', () => {
    for (const m of linuxMachines()) {
      const hn = (m.files ?? []).find(f => f.path === '/etc/hostname');
      expect(hn, `${m.id} sin /etc/hostname`).toBeDefined();
      expect(hn!.content, m.id).toBe(m.machine_info.hostname);
    }
  });

  it('/etc/hosts y los logs usan el hostname real de la máquina', () => {
    for (const m of linuxMachines()) {
      const hn = m.machine_info.hostname;
      const hosts = (m.files ?? []).find(f => f.path === '/etc/hosts');
      expect(hosts?.content, `${m.id} /etc/hosts`).toContain(`127.0.1.1\t${hn}`);

      const syslog = (m.files ?? []).find(f => f.path === '/var/log/syslog');
      if (syslog) expect(syslog.content, `${m.id} syslog`).toContain(`${hn} systemd[1]`);
    }
  });

  it('el hostname de cada lab es el de su escenario (no target-server)', () => {
    const byId = new Map(linuxMachines().map(m => [m.id, m]));
    expect(byId.get('lab-scenario-01-wp')?.machine_info.hostname).toBe('vulnerable-wp-lab');
    expect(byId.get('attacker-01')?.machine_info.hostname).toBe('kali-attacker');
    for (const m of linuxMachines()) {
      expect(m.machine_info.hostname, m.id).not.toBe('target-server');
    }
  });
});
