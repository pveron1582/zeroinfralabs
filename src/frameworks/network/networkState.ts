// ── frameworks/network/networkState.ts ──────────────────────────────
// Estado de red por máquina (ROADMAP Fase 6): reglas iptables, firewall
// ufw e interfaces. NO persistente (igual que ShellManager/ProcessManager).
// Afecta el estado efectivo de los puertos que reportan nmap, ss y netstat.

import type { Machine, Port } from '../../types';
import { buildProcessList, isServiceRunning } from '../process/processManager';

export type FirewallChain = 'INPUT' | 'OUTPUT' | 'FORWARD';
export type FirewallTarget = 'ACCEPT' | 'DROP' | 'REJECT';

export interface FirewallRule {
  id: number;
  chain: FirewallChain;
  protocol?: string;
  dport?: number;
  sport?: number;
  source?: string;
  target: FirewallTarget;
  sourceType: 'iptables' | 'ufw';
}

interface MachineNetState {
  rules: FirewallRule[];
  ufwEnabled: boolean;
  defaultPolicies: Partial<Record<FirewallChain, FirewallTarget>>;
  interfacesDown: Set<string>;
  nextRuleId: number;
}

// ── Estado por máquina ──────────────────────────────────────────────
const state = new Map<string, MachineNetState>();

function getState(machineId: string): MachineNetState {
  let s = state.get(machineId);
  if (!s) {
    s = { rules: [], ufwEnabled: false, defaultPolicies: {}, interfacesDown: new Set(), nextRuleId: 1 };
    state.set(machineId, s);
  }
  return s;
}

// ── Reglas activas (ufw solo aplica si está habilitado) ────────────
function activeRules(s: MachineNetState): FirewallRule[] {
  return s.rules.filter(r => r.sourceType !== 'ufw' || s.ufwEnabled);
}

export function listRules(machineId: string): FirewallRule[] {
  return [...getState(machineId).rules];
}

export function addRule(machineId: string, rule: Omit<FirewallRule, 'id' | 'sourceType'> & { sourceType?: 'iptables' | 'ufw' }): FirewallRule {
  const s = getState(machineId);
  const full: FirewallRule = { ...rule, id: s.nextRuleId++, sourceType: rule.sourceType ?? 'iptables' };
  s.rules.push(full);
  return full;
}

export function deleteRule(machineId: string, chain: FirewallChain, ruleNumber: number): boolean {
  const s = getState(machineId);
  const chainRules = s.rules.filter(r => r.chain === chain);
  const target = chainRules[ruleNumber - 1];
  if (!target) return false;
  const idx = s.rules.indexOf(target);
  s.rules.splice(idx, 1);
  return true;
}

export function flushRules(machineId: string, chain?: FirewallChain): void {
  const s = getState(machineId);
  s.rules = chain ? s.rules.filter(r => r.chain !== chain) : [];
  if (!chain) {
    s.defaultPolicies = {};
    s.ufwEnabled = false;
  }
}

/**
 * Reset de SOLO el firewall ufw (M2): elimina las reglas gestionadas por ufw,
 * apaga ufw y limpia sus default policies. A diferencia de flushRules(), NO
 * toca las reglas iptables manuales (en ufw real, `ufw reset` no las borra).
 */
export function resetUfw(machineId: string): void {
  const s = getState(machineId);
  s.rules = s.rules.filter(r => r.sourceType !== 'ufw');
  s.ufwEnabled = false;
  s.defaultPolicies = {};
}

export function setPolicy(machineId: string, chain: FirewallChain, target: FirewallTarget): void {
  getState(machineId).defaultPolicies[chain] = target;
}

export function getPolicy(machineId: string, chain: FirewallChain): FirewallTarget {
  const s = getState(machineId);
  return s.defaultPolicies[chain] || (s.ufwEnabled && chain === 'INPUT' ? 'DROP' : 'ACCEPT');
}

// ── ufw ─────────────────────────────────────────────────────────────
export function isUfwEnabled(machineId: string): boolean {
  return getState(machineId).ufwEnabled;
}

export function setUfwEnabled(machineId: string, enabled: boolean): void {
  getState(machineId).ufwEnabled = enabled;
}

// ── Interfaces ──────────────────────────────────────────────────────
export function isInterfaceDown(machineId: string, iface: string): boolean {
  return getState(machineId).interfacesDown.has(iface);
}

export function setInterfaceDown(machineId: string, iface: string, down: boolean): void {
  const s = getState(machineId);
  if (down) s.interfacesDown.add(iface);
  else s.interfacesDown.delete(iface);
}

// ── Estado efectivo de puertos ──────────────────────────────────────
function ruleMatchesPort(rule: FirewallRule, port: { port: number; protocol?: string }): boolean {
  if (rule.dport !== undefined && rule.dport !== port.port) return false;
  if (rule.protocol && rule.protocol !== 'all' && rule.protocol !== port.protocol) return false;
  return true;
}

function serviceNameForPort(port: Port): string | null {
  const map: Record<string, string> = {
    ssh: 'ssh',
    http: 'nginx',
    https: 'nginx',
    www: 'nginx',
    mysql: 'mysql',
    mariadb: 'mysql',
    ftp: 'vsftpd',
    'microsoft-ds': 'smb',
    'netbios-ssn': 'smb',
    'ms-wbt-server': 'xrdp',
    rdp: 'xrdp',
  };
  return map[port.service?.toLowerCase() || ''] ?? null;
}

export function isPortFiltered(machine: Machine, port: { port: number; protocol?: string }): boolean {
  const s = state.get(machine.id);
  if (!s) return false;
  // Como en iptables real: la PRIMERA regla que coincide decide el destino,
  // sin importar si es ACCEPT o DROP (el orden de inserción importa).
  for (const r of activeRules(s)) {
    if (r.chain !== 'INPUT') continue;
    if (!ruleMatchesPort(r, port)) continue;
    return r.target === 'DROP' || r.target === 'REJECT';
  }
  // Ninguna regla coincide: aplica la default policy de la cadena
  // (con ufw activo, INPUT cae en DROP).
  return getPolicy(machine.id, 'INPUT') === 'DROP';
}

export function effectivePortState(machine: Machine, port: Port): string {
  if (isPortFiltered(machine, port)) return 'filtered';
  const service = serviceNameForPort(port);
  // Solo se marca 'closed' si el servicio está modelado en el proceso base
  // (ej: nginx en Linux). Servicios sin proceso modelado (ej: SMB en Windows
  // 7) conservan su estado original, igual que antes de Fase 6.
  if (service && buildProcessList(machine).some(p => p.service === service) && !isServiceRunning(machine, service)) {
    return 'closed';
  }
  return port.state;
}

export interface ListeningPort {
  port: number;
  protocol: string;
  service: string;
  process?: string;
  pid?: number;
}

// Puertos realmente en escucha: estado 'open' original, servicio activo y
// sin regla de firewall que lo filtre.
export function getListeningPorts(machine: Machine): ListeningPort[] {
  const out: ListeningPort[] = [];
  for (const port of machine.scan_results?.ports || []) {
    if (port.state !== 'open') continue;
    if (effectivePortState(machine, port) !== 'open') continue;
    const service = serviceNameForPort(port);
    const proc = service ? buildProcessList(machine).find(p => p.service === service) : undefined;
    out.push({
      port: port.port,
      protocol: port.protocol,
      service: port.service,
      process: proc?.name ?? port.service,
      pid: proc?.pid,
    });
  }
  return out.sort((a, b) => a.port - b.port);
}

export function resetNetworkState(): void {
  state.clear();
}
