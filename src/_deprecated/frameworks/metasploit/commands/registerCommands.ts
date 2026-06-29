// ── frameworks/metasploit/commands/registerCommands.ts ────────────
// Phase 5a/b: Register native commands in ContextRegistry
// This file registers all MsfCommand-based commands

import { contextRegistry } from '../core/ContextRegistry';

// msfconsole / module commands
import { cmd_search } from './cmd_search';
import { cmd_use } from './cmd_use';
import { cmd_set } from './cmd_set';
import { cmd_back } from './cmd_back';
import { cmd_show } from './cmd_show';
import { cmd_info } from './cmd_info';
import { cmd_unset } from './cmd_unset';
import { cmd_clear } from './cmd_clear';
import { cmd_exit } from './cmd_exit';
import { cmd_banner } from './cmd_banner';

// meterpreter commands
import { cmd_getuid } from './cmd_getuid';
import { cmd_sysinfo } from './cmd_sysinfo';
import { cmd_ps } from './cmd_ps';
import { cmd_hashdump } from './cmd_hashdump';
import { cmd_shell } from './cmd_shell';

/**
 * Register all native commands in the ContextRegistry.
 * Call this during application initialization.
 */
export function registerNativeCommands(): void {
  // ── msfconsole / module context commands ───────────────────────────
  contextRegistry.register(cmd_search, ['msfconsole', 'module']);
  contextRegistry.register(cmd_use, ['msfconsole']);
  contextRegistry.register(cmd_set, ['msfconsole', 'module', 'meterpreter']);
  contextRegistry.register(cmd_back, ['module']);
  contextRegistry.register(cmd_show, ['msfconsole', 'module']);
  contextRegistry.register(cmd_info, ['msfconsole', 'module']);
  contextRegistry.register(cmd_unset, ['msfconsole', 'module']);
  contextRegistry.register(cmd_clear, ['msfconsole', 'module', 'meterpreter']);
  contextRegistry.register(cmd_exit, ['msfconsole', 'module', 'meterpreter']);
  contextRegistry.register(cmd_banner, ['msfconsole', 'module']);

  // ── meterpreter context commands ─────────────────────────────────
  contextRegistry.register(cmd_getuid, ['meterpreter']);
  contextRegistry.register(cmd_sysinfo, ['meterpreter']);
  contextRegistry.register(cmd_ps, ['meterpreter']);
  contextRegistry.register(cmd_hashdump, ['meterpreter']);
  contextRegistry.register(cmd_shell, ['meterpreter']);

  console.log('[MSF Phase 5a/b] Native commands registered in ContextRegistry');
}
