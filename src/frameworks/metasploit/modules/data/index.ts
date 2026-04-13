// ── frameworks/metasploit/modules/data/index.ts ────────────────────
// Aggregate all MSF modules for registration

// Exploits
import { ms17_010_eternalblue } from './exploits/ms17_010_eternalblue';

// Auxiliaries
import { smb_ms17_010 } from './auxiliary/smb_ms17_010';

// Payloads
import { meterpreter_reverse_tcp_x64, meterpreter_reverse_tcp_x86 } from './payloads/meterpreter_reverse_tcp';

// Aggregate all modules
export const ALL_MODULES = [
  // Exploits
  ms17_010_eternalblue,
  
  // Auxiliaries
  smb_ms17_010,
  
  // Payloads
  meterpreter_reverse_tcp_x64,
  meterpreter_reverse_tcp_x86,
];

// Re-export for individual access
export {
  ms17_010_eternalblue,
  smb_ms17_010,
  meterpreter_reverse_tcp_x64,
  meterpreter_reverse_tcp_x86,
};
