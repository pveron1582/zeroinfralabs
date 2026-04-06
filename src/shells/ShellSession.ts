// ── shells/ShellSession.ts ────────────────────────────────────────
// Interfaz base para todos los shells modulares

import type { Machine, CommandResponse, BlockingCommand, FileEntry } from '../types';

// ── Contexto que recibe cada shell ────────────────────────────────
export interface ShellContext {
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  language?: 'en' | 'es';
}

// ── Resultado de ejecutar un comando ──────────────────────────────
export interface ShellResult {
  output: string;
  isError?: boolean;
  completedMissionId?: number;
  newMachineId?: string;
  blockingCommand?: BlockingCommand;
  downloadedFile?: FileEntry;
  foundCredentials?: {
    machineId: string;
    user: string;
    pass: string;
    file: string;
    service?: string;
  };
  failedUser?: {
    machineId: string;
    user: string;
  };
  foundVulnerability?: {
    machineId: string;
    vulnId: string;
    status: 'detected' | 'confirmed';
  };
  // Indica que este resultado inicia una nueva sesión de shell
  startSession?: {
    shellName: string;
    args: string[];
  };
  // Indica que el shell actual debe cerrarse
  closeSession?: boolean;
  // Indica que se cerró una sesión SSH (para resetear directorio)
  sshSessionClosed?: boolean;
  // Usuario con el que se hizo login SSH
  sshLoginUser?: string;
  // Indica que se debe forward el comando al sistema real
  forwardCommand?: string;
}

// ── Interfaz que debe implementar cada shell ──────────────────────
export interface ShellSession<TState = any> {
  /** Nombre único del shell (ftp, ssh, msfconsole, meterpreter, etc.) */
  name: string;

  /** Prompt a mostrar cuando la sesión está activa */
  getPrompt(state: TState): string;

  /** Estado inicial de la sesión */
  createInitialState(args: string[], ctx: ShellContext): TState;

  /** Procesa un comando dentro de la sesión */
  executeCommand(input: string, state: TState, ctx: ShellContext): {
    result: ShellResult;
    newState: TState;
  };

  /** Verifica si la sesión sigue activa */
  isActive(state: TState): boolean;

  /** Limpia recursos al salir (opcional) */
  destroy?(state: TState): void;
}