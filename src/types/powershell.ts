// ── types/powershell.ts ───────────────────────────────────────────
// Estado de la sesión PowerShell interactiva (PLAN_WINDOWS W2).
// Análogo mínimo a MsfState: solo marca si el REPL PS está activo.

export interface PsState {
  active: boolean;
}
