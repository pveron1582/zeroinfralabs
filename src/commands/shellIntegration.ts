// ── commands/shellIntegration.ts ─────────────────────────────────
// Integración del executor de comandos con el ShellManager
// (sesiones interactivas SSH/FTP/NC apiladas)

// ── commands/shellIntegration.ts ─────────────────────────────────
// Integración del executor de comandos con el ShellManager
// (sesiones interactivas SSH/FTP/NC apiladas)

import type { CommandContext, CommandResponse } from '../types';
import { shellManager, type ShellContext as ManagerContext } from '../frameworks/shells';

export function toShellContext(ctx: CommandContext): ManagerContext {
  return {
    machine: ctx.machine,
    allMachines: ctx.allMachines,
    currentMissionId: ctx.currentMissionId,
    currentDir: ctx.currentDir,
    setCurrentDir: ctx.setCurrentDir || (() => {}),
    language: ctx.language,
    umask: ctx.umask,
  };
}

// ── Shell Manager Integration ─────────────────────────────────────
// Todas estas funciones son POR PROPIETARIO de terminal (P2-13/C1). Las que
// reciben ctx derivan ownerId de ctx.terminalId; el resto recibe ownerId por
// parámetro. Si no se pasa ownerId, se usa el stack compartido 'default'
// (comportamiento previo, retrocompatible con terminales sin id).

/** Verifica si hay una sesión de shell activa para el propietario. */
export const isShellSessionActive = (ownerId?: string) => shellManager.isActive(ownerId);

/** Obtiene el nombre del shell activo del propietario. */
export const getCurrentShellName = (ownerId?: string) => shellManager.getCurrentShellName(ownerId);

/** Obtiene el prompt del shell activo del propietario. */
export const getShellPrompt = (ownerId?: string) => shellManager.getPrompt(ownerId);

/** Iniciar una sesión de shell (llamado desde comandos como ftp, ssh -i, etc.) */
export const startShellSession = (shellName: string, args: string[], ctx: CommandContext, ownerId: string = ctx.terminalId || 'default'): CommandResponse => {
  const shellCtx = toShellContext(ctx);
  const result = shellManager.startSession(shellName, args, shellCtx, ownerId);

  if (result.isError) return result;

  const prompt = shellManager.getPrompt(ownerId);
  const current = shellManager.current(ownerId);

  if (shellName === 'ftp' && current) {
    const state = current.state;
    const targetIp = args[0] || state.targetIp || 'localhost';
    return {
      type: 'ftp',
      output: `Connected to ${targetIp}.\n220 (vsFTPd 3.0.3)`,
      ftpSession: {
        active: true, connected: state.connected,
        targetIp: state.targetIp, targetId: state.targetId,
        username: state.username, loggedIn: state.loggedIn, step: state.step,
      }
    };
  }

  if (shellName === 'ssh' && current) {
    const state = current.state;
    return {
      type: 'ssh',
      output: '',
      sshSession: {
        active: true, connected: state.connected,
        targetIp: state.targetIp, targetId: state.targetId,
        username: state.username, authenticated: state.authenticated, step: state.step,
      }
    };
  }

  return { output: prompt || '' };
};

/** Ejecutar un comando en el shell activo del propietario. */
export const executeShellCommand = (line: string, ctx: CommandContext, ownerId: string = ctx.terminalId || 'default'): CommandResponse => {
  if (!shellManager.isActive(ownerId)) {
    return { output: 'No active shell session', isError: true };
  }

  const shellCtx = toShellContext(ctx);
  const preExecName = shellManager.getCurrentShellName(ownerId);
  const result = shellManager.execute(line, shellCtx, ownerId);
  const current = shellManager.current(ownerId);

  // Nombre del shell para los metadatos: el vigente DESPUÉS de ejecutar
  // (si el comando anidó otro shell); si la sesión se cerró con este
  // comando, conservamos el previo para emitir el estado final correcto.
  const effectiveName = current?.shell.name ?? preExecName;

  const state = current?.state;
  const activeNow = shellManager.isActive(ownerId);

  const response: CommandResponse = {
    type: 'hybrid',
    output: result.output,
    isError: result.isError,
    newMachineId: result.newMachineId,
    blockingCommand: result.blockingCommand,
    downloadedFile: result.downloadedFile,
    foundCredentials: result.foundCredentials,
    failedUser: result.failedUser,
    foundVulnerability: result.foundVulnerability,
    sshSessionClosed: result.sshSessionClosed,
    sshLoginUser: result.sshLoginUser,
    ...(effectiveName === 'ftp' ? {
      ftpSession: {
        active: activeNow, connected: state?.connected,
        targetIp: state?.targetIp, targetId: state?.targetId,
        username: state?.username, loggedIn: state?.loggedIn, step: state?.step,
      }
    } : {}),
    ...(effectiveName === 'ssh' ? {
      sshSession: {
        active: activeNow, connected: state?.connected,
        targetIp: state?.targetIp, targetId: state?.targetId,
        username: state?.username, authenticated: state?.authenticated, step: state?.step,
      }
    } : {}),
  };

  return response;
};

/** Cerrar la sesión de shell del propietario, con respuesta según el TIPO de
 *  sesión (antes siempre respondía como FTP: "221 Goodbye." incluso para SSH/NC). */
export const closeShellSession = (ownerId?: string): CommandResponse => {
  const closing = shellManager.current(ownerId);
  const closingName = closing?.shell.name;
  const targetIp = (closing?.state as { targetIp?: string } | undefined)?.targetIp;
  shellManager.closeCurrentSession(ownerId);

  if (closingName === 'ssh') {
    return {
      type: 'ssh',
      output: `logout\nConnection to ${targetIp ?? 'remote'} closed.`,
      sshSession: { active: false, connected: false },
    };
  }
  if (closingName === 'ftp') {
    return { type: 'ftp', output: '221 Goodbye.', ftpSession: { active: false, connected: false } };
  }
  return { type: 'hybrid', output: 'Connection closed.' };
};

/** Reset del ShellManager al cambiar de escenario */
export const resetShellManager = () => shellManager.reset();

/** Resetea todas las sesiones de shell (útil al cambiar de escenario) */
export const resetShellSessions = () => shellManager.reset();
