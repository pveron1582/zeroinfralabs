// ── commands/tools/msfCommands/index.ts ───────────────────────────
// Export all MSF command handlers
// Phase 4: Now includes context-aware help integration

export { executeBaseCommand } from './msfBase';
export { executeMeterpreterCommand } from './msfMeterpreter';
export { executeShellCommand } from './msfShell';
export { executeExploitCommand } from './msfExploits';

// Phase 4: Context-aware help system
export {
  executeContextHelp,
  getContextPrompt,
  getContextAwareHelp,
  detectMsfContext,
} from './msfContextHelp';
