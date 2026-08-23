// ── commands/__tests__/fase6-network.test.ts ─────────────────────────
// Tests de la Fase 6 del ROADMAP: firewall (iptables/ufw), red
// (ip/ifconfig) y sockets (ss/netstat), incluyendo la integración
// con nmap (puertos filtrados).

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_iptables } from '../builtin/iptables';
import { cmd_ufw } from '../builtin/ufw';
import { cmd_ip } from '../builtin/ip';
import { cmd_ifconfig } from '../builtin/ifconfig';
import { cmd_ss, cmd_netstat } from '../builtin/ss';
import { cmd_nmap } from '../tools/nmap';
import { resetNetworkState, isPortFiltered } from '../../frameworks/network/networkState';
import type { Machine } from '../../types';

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx' },
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' },
        { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 8.0' },
      ],
    },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
    ...overrides,
  };
}

function makeRootMachine(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali Linux 2024.2', status: 'up', type: 'workstation' },
    ...overrides,
  });
}

function makeRootTarget(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({ su_user: 'root', ...overrides });
}

function ctx(machine: Machine) {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

function attackerCtx(target: Machine): ReturnType<typeof ctx> {
  const attacker = makeRootMachine();
  return { machine: attacker, allMachines: [attacker, target], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

describe('Fase 6 - iptables', () => {
  beforeEach(() => {
    resetNetworkState();
  });

  it('iptables -L lista las cadenas con su política por defecto', () => {
    const machine = makeRootMachine();
    const res = cmd_iptables.execute(['-L'], ctx(machine));
    expect(res.output).toContain('Chain INPUT (policy ACCEPT)');
    expect(res.output).toContain('Chain OUTPUT');
    expect(res.output).toContain('Chain FORWARD');
  });

  it('iptables -A INPUT -p tcp --dport 22 -j DROP filtra el puerto 22', () => {
    const machine = makeRootMachine();
    const res = cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'DROP'], ctx(machine));
    expect(res.isError).toBeFalsy();
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(true);
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(false);
  });

  it('iptables requiere root para modificar reglas', () => {
    const machine = makeMachine(); // no root
    const res = cmd_iptables.execute(['-A', 'INPUT', '--dport', '22', '-j', 'DROP'], ctx(machine));
    expect(res.isError).toBe(true);
    expect(res.output).toContain('Operation not permitted');
  });

  it('iptables -P INPUT DROP aplica default-deny', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-P', 'INPUT', 'DROP'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(true);
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '80', '-j', 'ACCEPT'], ctx(machine));
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(false);
  });

  it('iptables -D INPUT <n> borra una regla', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'DROP'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(true);
    const res = cmd_iptables.execute(['-D', 'INPUT', '1'], ctx(machine));
    expect(res.isError).toBeFalsy();
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(false);
  });

  it('iptables -F limpia todas las reglas', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'DROP'], ctx(machine));
    cmd_iptables.execute(['-P', 'INPUT', 'DROP'], ctx(machine));
    cmd_iptables.execute(['-F'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(false);
  });

  it('la PRIMERA regla que coincide gana (ACCEPT antes de DROP deja el puerto abierto)', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'ACCEPT'], ctx(machine));
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'DROP'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(false);
  });

  it('la PRIMERA regla que coincide gana (DROP antes de ACCEPT deja el puerto filtrado)', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '80', '-j', 'DROP'], ctx(machine));
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '80', '-j', 'ACCEPT'], ctx(machine));
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(true);
  });

  it('iptables valida cadenas y targets inválidos', () => {
    const machine = makeRootMachine();
    const badChain = cmd_iptables.execute(['-A', 'LOOP', '--dport', '22', '-j', 'DROP'], ctx(machine));
    expect(badChain.isError).toBe(true);
    const badTarget = cmd_iptables.execute(['-A', 'INPUT', '--dport', '22', '-j', 'FOO'], ctx(machine));
    expect(badTarget.isError).toBe(true);
  });
});

describe('Fase 6 - ufw', () => {
  beforeEach(() => {
    resetNetworkState();
  });

  it('ufw enable aplica default-deny sobre los puertos entrantes', () => {
    const machine = makeRootMachine();
    const res = cmd_ufw.execute(['enable'], ctx(machine));
    expect(res.output).toContain('Firewall is active');
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(true);
  });

  it('ufw allow 22/tcp abre el puerto cuando el firewall está activo', () => {
    const machine = makeRootMachine();
    cmd_ufw.execute(['enable'], ctx(machine));
    cmd_ufw.execute(['allow', '22/tcp'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(false);
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(true);
  });

  it('ufw deny guarda la regla y se aplica al habilitar el firewall', () => {
    const machine = makeRootMachine();
    cmd_ufw.execute(['deny', '80'], ctx(machine));
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(false);
    cmd_ufw.execute(['enable'], ctx(machine));
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(true);
  });

  it('ufw disable apaga el firewall pero no las reglas de iptables', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '80', '-j', 'DROP'], ctx(machine));
    cmd_ufw.execute(['enable'], ctx(machine));
    cmd_ufw.execute(['allow', '22/tcp'], ctx(machine));
    cmd_ufw.execute(['disable'], ctx(machine));
    expect(isPortFiltered(machine, { port: 22, protocol: 'tcp' })).toBe(false);
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(true);
  });

  it('ufw allow http usa el nombre de servicio', () => {
    const machine = makeRootMachine();
    cmd_ufw.execute(['enable'], ctx(machine));
    cmd_ufw.execute(['allow', 'http'], ctx(machine));
    expect(isPortFiltered(machine, { port: 80, protocol: 'tcp' })).toBe(false);
  });

  it('ufw status muestra las reglas activas', () => {
    const machine = makeRootMachine();
    cmd_ufw.execute(['allow', '22/tcp'], ctx(machine));
    const res = cmd_ufw.execute(['status'], ctx(machine));
    expect(res.output).toContain('Status: inactive');
    expect(res.output).toContain('22/tcp');
    expect(res.output).toContain('ALLOW');
  });

  it('ufw requiere root', () => {
    const machine = makeMachine();
    const res = cmd_ufw.execute(['enable'], ctx(machine));
    expect(res.isError).toBe(true);
  });
});

describe('Fase 6 - ip / ifconfig', () => {
  beforeEach(() => {
    resetNetworkState();
  });

  it('ip addr muestra las interfaces con su IP y MAC', () => {
    const machine = makeMachine();
    const res = cmd_ip.execute(['addr'], ctx(machine));
    expect(res.output).toContain('192.168.1.10/24');
    expect(res.output).toContain('eth0');
    expect(res.output).toContain('lo');
  });

  it('ip link set eth0 down refleja el estado DOWN', () => {
    const machine = makeRootMachine();
    cmd_ip.execute(['link', 'set', 'eth0', 'down'], ctx(machine));
    expect(cmd_ip.execute(['addr'], ctx(machine)).output).toContain('state DOWN');
    expect(cmd_ip.execute(['link'], ctx(machine)).output).toContain('state DOWN');
    expect(cmd_ifconfig.execute([], ctx(machine)).output).toContain('flags=4098<BROADCAST,MULTICAST>');
  });

  it('ip link set requiere root', () => {
    const machine = makeMachine();
    const res = cmd_ip.execute(['link', 'set', 'eth0', 'down'], ctx(machine));
    expect(res.isError).toBe(true);
    expect(res.output).toContain('Operation not permitted');
  });

  it('ip route muestra la ruta por defecto', () => {
    const machine = makeMachine();
    const res = cmd_ip.execute(['route'], ctx(machine));
    expect(res.output).toContain('default via 192.168.1.1');
    expect(res.output).toContain('192.168.1.0/24');
  });

  it('ifconfig sin cambios conserva el formato original', () => {
    const machine = makeMachine();
    const res = cmd_ifconfig.execute([], ctx(machine));
    expect(res.output).toContain('flags=4163<UP,BROADCAST,RUNNING,MULTICAST>');
    expect(res.output).toContain('inet 192.168.1.10');
  });
});

describe('Fase 6 - ss / netstat', () => {
  beforeEach(() => {
    resetNetworkState();
  });

  it('ss -tlnp muestra los puertos en escucha con su proceso', () => {
    const machine = makeMachine();
    const res = cmd_ss.execute(['-tlnp'], ctx(machine));
    expect(res.output).toContain('LISTEN');
    expect(res.output).toContain('0.0.0.0:22');
    expect(res.output).toContain('0.0.0.0:80');
    expect(res.output).toContain('sshd');
    expect(res.output).toContain('nginx');
  });

  it('ss -tnp muestra conexiones establecidas', () => {
    const machine = makeMachine();
    const res = cmd_ss.execute(['-tnp'], ctx(machine));
    expect(res.output).toContain('ESTAB');
    expect(res.output).toContain('0.0.0.0:22');
  });

  it('ss no muestra puertos filtrados por el firewall', () => {
    const machine = makeRootMachine();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '80', '-j', 'DROP'], ctx(machine));
    const res = cmd_ss.execute(['-tlnp'], ctx(machine));
    expect(res.output).not.toContain('0.0.0.0:80');
    expect(res.output).toContain('0.0.0.0:22');
  });

  it('netstat -tlnp muestra PID/Program name', () => {
    const machine = makeMachine();
    const res = cmd_netstat.execute(['-tlnp'], ctx(machine));
    expect(res.output).toContain('LISTEN');
    expect(res.output).toContain('PID/Program name');
    expect(res.output).toContain('sshd');
  });

  it('netstat -an muestra listening y established', () => {
    const machine = makeMachine();
    const res = cmd_netstat.execute(['-an'], ctx(machine));
    expect(res.output).toContain('LISTEN');
    expect(res.output).toContain('ESTABLISHED');
  });
});

describe('Fase 6 - integración con nmap', () => {
  beforeEach(() => {
    resetNetworkState();
  });

  it('nmap reporta como filtered un puerto bloqueado por iptables', () => {
    const target = makeRootTarget();
    cmd_iptables.execute(['-A', 'INPUT', '-p', 'tcp', '--dport', '22', '-j', 'DROP'], ctx(target));
    const res = cmd_nmap.execute(['-p', '22,80', '-v', '192.168.1.10'], attackerCtx(target));
    expect(res.output).toContain('22/tcp');
    expect(res.output).toContain('filtered');
    expect(res.output).toContain('80/tcp');
    expect(res.output).toContain('open');
  });

  it('nmap -sV con --open excluye los puertos filtrados', () => {
    const target = makeRootTarget();
    cmd_ufw.execute(['enable'], ctx(target));
    cmd_ufw.execute(['allow', '22/tcp'], ctx(target));
    const res = cmd_nmap.execute(['-sV', '--open', '192.168.1.10'], attackerCtx(target));
    expect(res.output).toContain('22/tcp');
    expect(res.output).not.toContain('80/tcp');
  });

  it('nmap filtra un puerto al habilitar ufw con regla deny previa', () => {
    const target = makeRootTarget();
    cmd_ufw.execute(['deny', '3306'], ctx(target));
    const res = cmd_nmap.execute(['-sV', '-p', '3306', '-v', '192.168.1.10'], attackerCtx(target));
    expect(res.output).toContain('3306/tcp');
    expect(res.output).toContain('open');
    cmd_ufw.execute(['enable'], ctx(target));
    const res2 = cmd_nmap.execute(['-sV', '-p', '3306', '-v', '192.168.1.10'], attackerCtx(target));
    expect(res2.output).toContain('filtered');
  });
});
