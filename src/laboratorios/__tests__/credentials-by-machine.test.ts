// ── laboratorios/__tests__/credentials-by-machine.test.ts ─────────────
// Sistema general de usuario/password por máquina:
//  - El usuario `kali` NO debe aparecer en los targets de lab (solo existe
//    en la máquina atacante Kali).
//  - Cada target Linux define `known_passwords` con root + usuarios normales.
//  - Los usuarios normales existen en /etc/passwd y tienen su /home.
//  - La máquina atacante (Kali) no tiene tabla de passwords (es root).

import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '../laboratorios';
import type { Machine } from '../../types';

const LINUX_TARGETS = SCENARIOS.filter(s => s.id !== 'scenario-03');

const EXPECTED_USERS: Record<string, string[]> = {
  'scenario-01': ['mario', 'sara'],
  'scenario-02': ['carla', 'diego'],
  'scenario-04': ['lucia', 'ivan'],
  'scenario-05': ['marta', 'pablo'],
  'scenario-06': ['ftpuser', 'nuria', 'raul'],
  'scenario-07': ['admin', 'analyst'],
};

function targetOf(scenarioId: string): Machine {
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;
  return scenario.machines.find(m => !m.id.includes('attacker'))!;
}

function attackerOf(scenarioId: string): Machine {
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;
  return scenario.machines.find(m => m.id.includes('attacker'))!;
}

function passwdOf(machine: Machine): string {
  return machine.files?.find(f => f.path === '/etc/passwd')?.content ?? '';
}

describe('Sistema general de passwords por máquina', () => {
  it('ningún target Linux contiene el usuario kali en /etc/passwd', () => {
    for (const scenario of LINUX_TARGETS) {
      expect(passwdOf(targetOf(scenario.id)), scenario.id).not.toMatch(/kali:x:/);
      expect(passwdOf(targetOf(scenario.id)), scenario.id).not.toMatch(/Kali Linux Default User/);
    }
  });

  it('cada target Linux define known_passwords con root y users normales', () => {
    for (const scenario of LINUX_TARGETS) {
      const target = targetOf(scenario.id);
      expect(target.known_passwords?.root, `${scenario.id} root`).toBeDefined();
      for (const user of EXPECTED_USERS[scenario.id]) {
        expect(target.known_passwords?.[user], `${scenario.id} ${user}`).toBeDefined();
      }
    }
  });

  it('root y los usuarios normales existen en /etc/passwd con shell de login y home', () => {
    for (const scenario of LINUX_TARGETS) {
      const target = targetOf(scenario.id);
      const passwd = passwdOf(target);
      expect(passwd, scenario.id).toMatch(/^root:x:0:0:root:\/root:\/bin\/bash$/m);
      for (const user of EXPECTED_USERS[scenario.id]) {
        expect(passwd, `${scenario.id} ${user}`).toMatch(new RegExp(`^${user}:x:\\d+:`, 'm'));
        const home = target.files?.find(f => f.path === `/home/${user}/.dir`);
        expect(home, `${scenario.id} /home/${user}`).toBeDefined();
        expect(home?.owner).toBe(user);
        expect(home?.group).toBe(user);
      }
    }
  });

  it('el atacante Kali conserva su usuario kali y define su tabla de passwords', () => {
    for (const scenario of LINUX_TARGETS) {
      const attacker = attackerOf(scenario.id);
      expect(attacker.known_passwords?.kali, `${scenario.id} kali`).toBe('zilabs');
      expect(attacker.known_passwords?.root, `${scenario.id} root`).toBe('zilabs');
      expect(passwdOf(attacker), scenario.id).toMatch(/^kali:x:1000:1000:kali:\/home\/kali:\/bin\/bash$/m);
      expect(passwdOf(attacker), scenario.id).not.toMatch(/kali:x:1001:/);
    }
  });
});
