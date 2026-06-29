// ── frameworks/metasploit/orchestrators/index.ts ─────────────────
// Export all MSF command handlers

export { executeBaseCommand } from './msfBase';
export { executeMeterpreterCommand } from './msfMeterpreter';
export { executeShellCommand } from './msfShell';
export { executeExploitCommand } from './msfExploits';
export {
  executeContextHelp,
  getContextPrompt,
  getContextAwareHelp,
  detectMsfContext,
} from './msfContextHelp';
