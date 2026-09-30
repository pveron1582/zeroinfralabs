// ── types/msf.ts ──────────────────────────────────────────────────
// Estado de Metasploit compartido: única fuente de verdad para el store
// (slices), el executor, los hooks y frameworks/metasploit.
// Antes vivía duplicado en frameworks/metasploit/core/msfTypes.ts y se
// importaba desde commands/tools/msfconsole (ver mejoras_glm.md P1-11).

export interface MsfSession {
  id: number;
  type: 'meterpreter' | 'shell';
  targetInfo?: { os?: string };
}

export interface MsfState {
  active: boolean;
  module?: string;
  moduleType?: string;
  options: Record<string, string>;
  moduleOptions?: Record<string, string>;
  sessionOpen: boolean;
  shellMode: boolean;
  // Cwd de la sesión sobre la víctima (Windows). Vive en el estado MSF
  // (aislado por terminal) para que el prompt de meterpreter/cmd refleje
  // el directorio real sin depender del cwd de la terminal atacante.
  cwd?: string;
  // Identidad de la sesión sobre la víctima: la fija el exploit que la
  // abre (EternalBlue deja SYSTEM; el RCE del webmail deja la cuenta del
  // servicio). Sin `sessionUser` la sesión es SYSTEM por compatibilidad.
  sessionUser?: string;
  // Máquina víctima de la sesión: whoami/hostname/sysinfo leen de ella en
  // vez de hardcodear el host del lab.
  sessionTargetId?: string;
  auxChecked: boolean;
  uidChecked: boolean;
  hashdumpExecuted?: boolean;
  lastSearchResults?: string[];
  sessions?: MsfSession[];
  currentSessionId?: number;
}

/** Módulo del framework de Metasploit (autocomplete y listado de módulos). */
export interface MsfModule {
  path: string;
  type: 'auxiliary' | 'exploit' | 'post' | 'payload';
  desc: string;
  rank: 'normal' | 'average' | 'great' | 'manual';
}

/**
 * Contexto actual de la consola MSF: decide qué comandos existen y qué
 * prompt se muestra. Vive acá (y no en el framework) porque es un contrato
 * de dominio, igual que `MsfModule`.
 */
export type MsfContextType =
  | 'msfconsole'   // consola base, sin módulo cargado
  | 'module'       // módulo cargado, viendo opciones
  | 'meterpreter'  // sesión de meterpreter activa
  | 'windows_shell' // cmd.exe abierto desde meterpreter
  | 'linux_shell';  // shell de Linux desde meterpreter
