// ── commands/powershell/index.ts ──────────────────────────────────
// Barrel del sub-sistema PowerShell MVP (PLAN_WINDOWS W2).

export { cmd_powershell, executePsLine, type PsNativeDispatch } from './session';
export { parsePsLine, getParam, pathArg, type PsInvocation } from './parser';
export { PS_ALIASES, resolvePsCommand } from './aliases';
export { PS_CMDLETS, getPsCmdlet, listPsCmdletNames } from './cmdlets';
