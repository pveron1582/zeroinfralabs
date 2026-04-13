// ── shells/ShellManager.ts ────────────────────────────────────────
// Orquestador central con stack de shells anidados

import type { ShellSession, ShellContext, ShellResult } from './ShellSession';

// ── Frame del stack: cada nivel de shell ──────────────────────────
interface ShellFrame {
  shell: ShellSession;
  state: any;
  prompt: string;
}

// ── ShellManager: gestiona el stack de shells ─────────────────────
export class ShellManager {
  private stack: ShellFrame[] = [];
  private registry: Map<string, ShellSession> = new Map();

  // ── Registro de shells disponibles ──────────────────────────────
  register(shell: ShellSession): void {
    this.registry.set(shell.name, shell);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.registry.keys());
  }

  // ── Gestión del stack ───────────────────────────────────────────

  /** Iniciar una nueva sesión de shell (push al stack) */
  startSession(shellName: string, args: string[], ctx: ShellContext): ShellResult {
    const shell = this.registry.get(shellName);
    if (!shell) {
      return { output: `Unknown shell: ${shellName}`, isError: true };
    }

    const state = shell.createInitialState(args, ctx);
    const prompt = shell.getPrompt(state);

    this.stack.push({ shell, state, prompt });

    // Ejecutar un comando inicial si se proporciona
    // (por ejemplo, mostrar banner de bienvenida)
    return { output: '' };
  }

  /** Cerrar el shell actual (pop del stack) */
  closeCurrentSession(): ShellFrame | null {
    const current = this.stack.pop();
    if (current?.shell.destroy) {
      current.shell.destroy(current.state);
    }
    return this.current();
  }

  /** Shell actual (tope del stack) */
  current(): ShellFrame | null {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }

  /** ¿Hay alguna sesión activa? */
  isActive(): boolean {
    return this.stack.length > 0;
  }

  /** Nombre del shell actual */
  getCurrentShellName(): string | null {
    return this.current()?.shell.name || null;
  }

  /** Prompt del shell actual */
  getPrompt(): string {
    return this.current()?.prompt || '';
  }

  /** Profundidad del stack */
  getDepth(): number {
    return this.stack.length;
  }

  /** Ruta de shells activos (para debug) */
  getShellPath(): string[] {
    return this.stack.map(f => f.shell.name);
  }

  // ── Ejecución de comandos ───────────────────────────────────────

  /** Ejecutar un comando en el shell actual */
  execute(input: string, ctx: ShellContext): ShellResult {
    const frame = this.current();
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
        this.closeCurrentSession();
      }

      return result;
    } catch (error) {
      console.error(`Error in shell ${frame.shell.name}:`, error);
      return { output: `Shell error: ${error}`, isError: true };
    }
  }

  // ── Serialización (para persistencia en Zustand) ────────────────

  /** Serializar el stack para persistencia */
  serialize(): Array<{ shellName: string; state: any }> {
    return this.stack.map(frame => ({
      shellName: frame.shell.name,
      state: frame.state,
    }));
  }

  /** Restaurar el stack desde persistencia */
  deserialize(data: Array<{ shellName: string; state: any }>, ctx: ShellContext): boolean {
    this.stack = [];

    for (const item of data) {
      const shell = this.registry.get(item.shellName);
      if (!shell) {
        console.warn(`Cannot restore shell: ${item.shellName}`);
        return false;
      }

      this.stack.push({
        shell,
        state: item.state,
        prompt: shell.getPrompt(item.state),
      });
    }

    return true;
  }

  // ── Reset completo ──────────────────────────────────────────────
  reset(): void {
    // Destruir todos los shells activos
    while (this.stack.length > 0) {
      this.closeCurrentSession();
    }
  }
}

// ── Instancia singleton ──────────────────────────────────────────
export const shellManager = new ShellManager();