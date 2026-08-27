// ── shells/ShellManager.ts ────────────────────────────────────────
// Orquestador central con stacks de shells POR PROPIETARIO (terminal).
// C1 / P2-13: antes era un stack único global — una sesión SSH/FTP/NC abierta
// en una terminal secuestraba la escritura de las demás. Ahora cada ownerId
// (id único de terminal) tiene su propio stack; si no se pasa ownerId, se usa
// el stack compartido 'default' (comportamiento previo, retrocompatible).

import type { ShellSession, ShellContext, ShellResult } from './ShellSession';

// ── Frame del stack: cada nivel de shell ──────────────────────────
interface ShellFrame {
  shell: ShellSession;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  prompt: string;
}

export type ShellOwnerId = string;

// ── ShellManager: gestiona los stacks de shells por propietario ──
export class ShellManager {
  private stacks = new Map<string, ShellFrame[]>();
  private registry: Map<string, ShellSession> = new Map();

  private ownerKey(ownerId?: ShellOwnerId | null): string {
    return ownerId || 'default';
  }

  private stackFor(ownerId?: ShellOwnerId | null): ShellFrame[] {
    const key = this.ownerKey(ownerId);
    let stack = this.stacks.get(key);
    if (!stack) {
      stack = [];
      this.stacks.set(key, stack);
    }
    return stack;
  }

  // ── Registro de shells disponibles ──────────────────────────────
  register(shell: ShellSession): void {
    this.registry.set(shell.name, shell);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.registry.keys());
  }

  /** Propietarios (terminales) con al menos una sesión activa. */
  getActiveOwners(): string[] {
    return Array.from(this.stacks.entries())
      .filter(([, stack]) => stack.length > 0)
      .map(([key]) => key);
  }

  // ── Gestión del stack ───────────────────────────────────────────

  /** Iniciar una nueva sesión de shell (push al stack del propietario). */
  startSession(shellName: string, args: string[], ctx: ShellContext, ownerId?: ShellOwnerId | null): ShellResult {
    const shell = this.registry.get(shellName);
    if (!shell) {
      return { output: `Unknown shell: ${shellName}`, isError: true };
    }

    const state = shell.createInitialState(args, ctx);
    const prompt = shell.getPrompt(state);

    this.stackFor(ownerId).push({ shell, state, prompt });

    // Ejecutar un comando inicial si se proporciona
    // (por ejemplo, mostrar banner de bienvenida)
    return { output: '' };
  }

  /** Cerrar el shell actual (pop del stack). Devuelve el frame CERRADO. */
  closeCurrentSession(ownerId?: ShellOwnerId | null): ShellFrame | null {
    const stack = this.stackFor(ownerId);
    if (stack.length === 0) return null;
    const closed = stack.pop();
    if (closed?.shell.destroy) {
      closed.shell.destroy(closed.state);
    }
    return closed ?? null;
  }

  /** Shell actual (tope del stack) del propietario. */
  current(ownerId?: ShellOwnerId | null): ShellFrame | null {
    const stack = this.stackFor(ownerId);
    if (stack.length === 0) return null;
    return stack[stack.length - 1];
  }

  /** ¿Hay alguna sesión activa para este propietario? */
  isActive(ownerId?: ShellOwnerId | null): boolean {
    return this.stackFor(ownerId).length > 0;
  }

  /** Nombre del shell actual del propietario. */
  getCurrentShellName(ownerId?: ShellOwnerId | null): string | null {
    return this.current(ownerId)?.shell.name || null;
  }

  /** Prompt del shell actual del propietario. */
  getPrompt(ownerId?: ShellOwnerId | null): string {
    return this.current(ownerId)?.prompt || '';
  }

  /** Profundidad del stack del propietario. */
  getDepth(ownerId?: ShellOwnerId | null): number {
    return this.stackFor(ownerId).length;
  }

  /** Ruta de shells activos del propietario (para debug). */
  getShellPath(ownerId?: ShellOwnerId | null): string[] {
    return this.stackFor(ownerId).map(f => f.shell.name);
  }

  // ── Ejecución de comandos ───────────────────────────────────────

  /** Ejecutar un comando en el shell actual del propietario. */
  execute(input: string, ctx: ShellContext, ownerId?: ShellOwnerId | null): ShellResult {
    const frame = this.current(ownerId);
    if (!frame) {
      return { output: 'No active session', isError: true };
    }

    try {
      const { result, newState } = frame.shell.executeCommand(input, frame.state, ctx);

      // Actualizar estado y prompt del frame
      frame.state = newState;
      frame.prompt = frame.shell.getPrompt(newState);

      // Si el shell indica que debe cerrarse
      if (result.closeSession || !frame.shell.isActive(newState)) {
        this.closeCurrentSession(ownerId);
      }

      return result;
    } catch (error) {
      console.error(`Error in shell ${frame.shell.name}:`, error);
      return { output: `Shell error: ${error}`, isError: true };
    }
  }

  // ── Reset completo ──────────────────────────────────────────────
  reset(): void {
    // Destruir todos los shells de todas las stacks
    for (const stack of this.stacks.values()) {
      while (stack.length > 0) {
        const frame = stack.pop();
        if (frame?.shell.destroy) {
          frame.shell.destroy(frame.state);
        }
      }
    }
    this.stacks.clear();
  }
}

// ── Instancia singleton ──────────────────────────────────────────
export const shellManager = new ShellManager();