// ── frameworks/network/__tests__/networkState.test.ts ──────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO del estado de red. Antes solo se llegaba por rebote desde
// `fase6-network.test.ts` (iptables/ufw como comandos) y se quedaban sin
// correr: insertRule en los extremos, flush total, resetUfw (que NO
// existía en ningún test), reglas de cadena distinta de INPUT, reglas con
// protocolo que no matchea, servicio detenido ⇒ puerto 'closed', y
// puertos sin servicio o sin scan_results.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  listRules, addRule, insertRule, deleteRule, flushRules, resetUfw,
  setPolicy, getPolicy, isUfwEnabled, setUfwEnabled,
  isInterfaceDown, setInterfaceDown,
  isPortFiltered, effectivePortState, getListeningPorts, resetNetworkState,
} from '../networkState';
import { stopService, resetProcessManager } from '../../process/processManager';
import type { Machine, Port } from '../../../types';

const MID = 'target-01';

function makeMachine(over: Partial<Machine> = {}): Machine {
  return {
    id: MID,
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx' },
    ] },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
    ...over,
  } as Machine;
}

const port = (over: Partial<Port> = {}): Port =>
  ({ port: 8080, protocol: 'tcp', state: 'open', service: 'http', version: '', ...over }) as Port;

beforeEach(() => { resetNetworkState(); resetProcessManager(); });

describe('addRule / insertRule', () => {
  it('sin sourceType explícito la regla es iptables', () => {
    const r = addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 22 });
    expect(r.sourceType).toBe('iptables');
    expect(r.id).toBe(1);
    // los ids incrementan por máquina
    expect(addRule(MID, { chain: 'INPUT', target: 'ACCEPT' }).id).toBe(2);
  });

  it('insertRule en posición más allá del final agrega al final', () => {
    addRule(MID, { chain: 'INPUT', target: 'ACCEPT' });
    addRule(MID, { chain: 'INPUT', target: 'ACCEPT' });
    const r = insertRule(MID, 'INPUT', 99, { chain: 'INPUT', target: 'DROP' });
    expect(r.sourceType).toBe('iptables');
    const chain = listRules(MID).filter(x => x.chain === 'INPUT');
    expect(chain).toHaveLength(3);
    expect(chain[2].target).toBe('DROP');
  });

  it('insertRule en posición 0 (o no numérica) cae a la primera de la cadena', () => {
    addRule(MID, { chain: 'INPUT', target: 'ACCEPT', dport: 22 });
    insertRule(MID, 'INPUT', 0, { chain: 'INPUT', target: 'DROP', dport: 80 });
    const chain = listRules(MID).filter(x => x.chain === 'INPUT');
    expect(chain[0].dport).toBe(80);
    expect(chain[1].dport).toBe(22);
  });

  it('insertRule respeta el orden dentro de su cadena sin tocar las otras', () => {
    addRule(MID, { chain: 'OUTPUT', target: 'ACCEPT' });
    insertRule(MID, 'INPUT', 1, { chain: 'INPUT', target: 'DROP' });
    expect(listRules(MID).map(r => r.chain)).toEqual(['OUTPUT', 'INPUT']);
  });
});

describe('deleteRule / flushRules / resetUfw', () => {
  it('deleteRule con un número fuera de rango devuelve false', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP' });
    expect(deleteRule(MID, 'INPUT', 5)).toBe(false);
    expect(deleteRule(MID, 'INPUT', 0)).toBe(false);
    expect(listRules(MID)).toHaveLength(1);
  });

  it('deleteRule borra la regla que corresponde por número de cadena', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP' });
    addRule(MID, { chain: 'INPUT', target: 'ACCEPT' });
    expect(deleteRule(MID, 'INPUT', 1)).toBe(true);
    expect(listRules(MID).map(r => r.target)).toEqual(['ACCEPT']);
  });

  it('flushRules de una cadena no toca las demás ni el resto del estado', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP' });
    addRule(MID, { chain: 'OUTPUT', target: 'ACCEPT' });
    setPolicy(MID, 'INPUT', 'ACCEPT');
    setUfwEnabled(MID, true);

    flushRules(MID, 'INPUT');
    expect(listRules(MID).map(r => r.chain)).toEqual(['OUTPUT']);
    expect(getPolicy(MID, 'INPUT')).toBe('ACCEPT');
    expect(isUfwEnabled(MID)).toBe(true);
  });

  it('flushRules sin cadena borra todo: reglas, policies y ufw', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP' });
    addRule(MID, { chain: 'OUTPUT', target: 'ACCEPT' });
    setPolicy(MID, 'OUTPUT', 'DROP');
    setUfwEnabled(MID, true);

    flushRules(MID);
    expect(listRules(MID)).toEqual([]);
    expect(isUfwEnabled(MID)).toBe(false);
    expect(getPolicy(MID, 'OUTPUT')).toBe('ACCEPT'); // policy reseteada
  });

  it('resetUfw quita solo las reglas de ufw y preserva las iptables manuales', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 23, sourceType: 'ufw' });
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 22 });          // iptables
    setUfwEnabled(MID, true);
    setPolicy(MID, 'INPUT', 'DROP');

    resetUfw(MID);
    expect(isUfwEnabled(MID)).toBe(false);
    expect(listRules(MID).map(r => r.dport)).toEqual([22]);
    expect(getPolicy(MID, 'INPUT')).toBe('ACCEPT'); // defaultPolicies limpias
  });

  it('con ufw apagado sus reglas existen pero no se aplican', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 443, sourceType: 'ufw' });
    expect(isPortFiltered(makeMachine(), port({ port: 443 }))).toBe(false);
    setUfwEnabled(MID, true);
    expect(isPortFiltered(makeMachine(), port({ port: 443 }))).toBe(true);
  });
});

describe('interfaces', () => {
  it('baja y sube una interfaz', () => {
    expect(isInterfaceDown(MID, 'eth0')).toBe(false);
    setInterfaceDown(MID, 'eth0', true);
    expect(isInterfaceDown(MID, 'eth0')).toBe(true);
    setInterfaceDown(MID, 'eth0', false);
    expect(isInterfaceDown(MID, 'eth0')).toBe(false);
  });
});

describe('estado efectivo de puertos', () => {
  it('una regla con protocolo distinto no matchea el puerto', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 80, protocol: 'udp' });
    expect(isPortFiltered(makeMachine(), port({ port: 80, protocol: 'tcp' }))).toBe(false);
  });

  it('la primera regla INPUT que matchea decide (sea DROP o ACCEPT)', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 80 });
    addRule(MID, { chain: 'INPUT', target: 'ACCEPT', dport: 80 });
    expect(isPortFiltered(makeMachine(), port({ port: 80 }))).toBe(true);
  });

  it('una regla en FORWARD no filtra el tráfico de entrada', () => {
    addRule(MID, { chain: 'FORWARD', target: 'DROP', dport: 80 });
    expect(isPortFiltered(makeMachine(), port({ port: 80 }))).toBe(false);
  });

  it('sin reglas que matcheen aplica la política por defecto de INPUT', () => {
    expect(isPortFiltered(makeMachine(), port({ port: 80 }))).toBe(false);
    setPolicy(MID, 'INPUT', 'DROP');
    expect(isPortFiltered(makeMachine(), port({ port: 80 }))).toBe(true);
  });

  it('con ufw habilitado y sin reglas, INPUT cae en DROP', () => {
    setUfwEnabled(MID, true);
    expect(isPortFiltered(makeMachine(), port({ port: 22 }))).toBe(true);
    setUfwEnabled(MID, false);
    expect(isPortFiltered(makeMachine(), port({ port: 22 }))).toBe(false);
  });

  it('un servicio modelado pero detenido cierra el puerto', () => {
    const m = makeMachine();
    expect(effectivePortState(m, port({ port: 80 }))).toBe('open');
    stopService(m, 'nginx');
    expect(effectivePortState(m, port({ port: 80 }))).toBe('closed');
  });

  it('un puerto filtrado por firewall queda en filtered', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 80 });
    expect(effectivePortState(makeMachine(), port({ port: 80 }))).toBe('filtered');
  });

  it('un servicio sin proceso modelado conserva su estado original', () => {
    // 'microsoft-ds' → smb, que no está en buildProcessList de esta máquina.
    expect(effectivePortState(makeMachine(), port({ port: 445, service: 'microsoft-ds' }))).toBe('open');
  });
});

describe('getListeningPorts', () => {
  it('lista solo puertos abiertos, vivos y sin firewall que los filtre', () => {
    expect(getListeningPorts(makeMachine()).map(p => p.port)).toEqual([22, 80]);
  });

  it('un puerto cerrado no aparece', () => {
    const m = makeMachine({ scan_results: { ports: [port({ port: 9999, state: 'closed' })] } });
    expect(getListeningPorts(m)).toEqual([]);
  });

  it('un puerto sin servicio aparece sin proceso asociado', () => {
    const m = makeMachine({ scan_results: { ports: [port({ port: 8080, service: undefined })] } });
    const out = getListeningPorts(m);
    expect(out).toHaveLength(1);
    expect(out[0].service).toBeUndefined();
    expect(out[0].process).toBeUndefined();
    expect(out[0].pid).toBeUndefined();
  });

  it('un puerto filtrado por firewall desaparece de la lista', () => {
    addRule(MID, { chain: 'INPUT', target: 'DROP', dport: 22 });
    expect(getListeningPorts(makeMachine()).map(p => p.port)).toEqual([80]);
  });

  it('una máquina sin scan_results no revienta y devuelve vacío', () => {
    const m = makeMachine();
    delete (m as { scan_results?: unknown }).scan_results;
    expect(getListeningPorts(m)).toEqual([]);
  });

  it('los puertos salen ordenados por número', () => {
    const m = makeMachine({ scan_results: { ports: [
      port({ port: 8080 }), port({ port: 21, service: 'ftp' }), port({ port: 22, service: 'ssh' }),
    ] } });
    expect(getListeningPorts(m).map(p => p.port)).toEqual([21, 22, 8080]);
  });
});
