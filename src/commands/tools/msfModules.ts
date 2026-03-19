// ── commands/tools/msfModules.ts ──────────────────────────────────
// MSF module database (subset realistic for EternalBlue labs)

export interface MsfModule {
  path: string;
  type: 'auxiliary' | 'exploit' | 'post' | 'payload';
  desc: string;
  rank: 'normal' | 'average' | 'great' | 'manual';
}

export const MSF_MODULES: MsfModule[] = [
  // Auxiliaries
  { path: 'auxiliary/scanner/smb/smb_ms17_010',   type: 'auxiliary', desc: 'MS17-010 SMB RCE Detection',          rank: 'normal'    },
  { path: 'auxiliary/scanner/smb/smb_version',    type: 'auxiliary', desc: 'SMB Version Detection',               rank: 'normal'    },
  { path: 'auxiliary/scanner/portscan/tcp',        type: 'auxiliary', desc: 'TCP Port Scanner',                    rank: 'normal'    },
  { path: 'auxiliary/scanner/smb/smb_login',       type: 'auxiliary', desc: 'SMB Login Check Scanner',             rank: 'normal'    },
  { path: 'auxiliary/scanner/http/http_version',   type: 'auxiliary', desc: 'HTTP Version Detection',              rank: 'normal'    },
  // Exploits
  { path: 'exploit/windows/smb/ms17_010_eternalblue', type: 'exploit', desc: 'MS17-010 EternalBlue SMB RCE',      rank: 'average'   },
  { path: 'exploit/windows/smb/ms17_010_psexec',      type: 'exploit', desc: 'MS17-010 EternalBlue PsExec',       rank: 'normal'    },
  { path: 'exploit/windows/smb/smb_doublepulsar_rce', type: 'exploit', desc: 'SMB DOUBLEPULSAR RCE',              rank: 'great'     },
  { path: 'exploit/windows/smb/ms08_067_netapi',      type: 'exploit', desc: 'MS08-067 Microsoft Server Service', rank: 'great'     },
  { path: 'exploit/multi/handler',                     type: 'exploit', desc: 'Generic Payload Handler',           rank: 'manual'    },
  // Payloads (shown in search only)
  { path: 'payload/windows/x64/meterpreter/reverse_tcp', type: 'payload', desc: 'Windows x64 Meterpreter Reverse TCP', rank: 'normal' },
  { path: 'payload/windows/meterpreter/reverse_tcp',     type: 'payload', desc: 'Windows Meterpreter Reverse TCP',     rank: 'normal' },
  // Post
  { path: 'post/multi/manage/shell_to_meterpreter', type: 'post', desc: 'Shell to Meterpreter Upgrade',           rank: 'normal'   },
  { path: 'post/windows/gather/hashdump',           type: 'post', desc: 'Windows Credential Hashdump',            rank: 'normal'   },
];

/**
 * Get module defaults options per module
 */
export const MODULE_DEFAULTS: Record<string, Record<string, string>> = {
  'auxiliary/scanner/smb/smb_ms17_010': {
    RHOSTS: '', RPORT: '445', THREADS: '1',
  },
  'auxiliary/scanner/smb/smb_version': {
    RHOSTS: '', RPORT: '445', THREADS: '1',
  },
  'exploit/windows/smb/ms17_010_eternalblue': {
    RHOSTS: '', RPORT: '445', LHOST: '', LPORT: '4444',
    PAYLOAD: 'windows/x64/meterpreter/reverse_tcp',
    VerifyArch: 'true', VerifyTarget: 'true',
  },
};
