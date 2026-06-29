// ── modules/data/payloads/meterpreter_reverse_tcp.ts ─────────────
// Windows Meterpreter Reverse TCP Payloads

import type { PayloadModule } from '../../types';

export const meterpreter_reverse_tcp_x64: PayloadModule = {
  path: 'payload/windows/x64/meterpreter/reverse_tcp',
  type: 'payload',
  name: 'Windows x64 Meterpreter Reverse TCP',
  description: 'Connect back to attacker and spawn a Meterpreter shell (Windows x64)',
  rank: 'normal',
  platform: 'windows',
  arch: 'x64',
  connectionType: 'reverse',
  
  options: {
    LHOST: {
      name: 'LHOST',
      description: 'The listen address (an interface may be specified)',
      type: 'string',
      required: true,
    },
    LPORT: {
      name: 'LPORT',
      description: 'The listen port',
      type: 'integer',
      default: '4444',
      required: false,
    },
    EXITFUNC: {
      name: 'EXITFUNC',
      description: "Exit technique (Accepted: '', seh, thread, process, none)",
      type: 'enum',
      default: 'process',
      enumValues: ['seh', 'thread', 'process', 'none'],
      required: false,
    },
  },
  
  defaultOptions: {
    LPORT: '4444',
    EXITFUNC: 'process',
  },
  
  requiredOptions: ['LHOST', 'LPORT'],
  
  generateDescription: (options): string => {
    const lhost = options.LHOST || '0.0.0.0';
    const lport = options.LPORT || '4444';
    return `reverse tcp Meterpreter shell connecting to ${lhost}:${lport}`;
  },
};

export const meterpreter_reverse_tcp_x86: PayloadModule = {
  path: 'payload/windows/meterpreter/reverse_tcp',
  type: 'payload',
  name: 'Windows Meterpreter Reverse TCP',
  description: 'Connect back to attacker and spawn a Meterpreter shell (Windows x86)',
  rank: 'normal',
  platform: 'windows',
  arch: 'x86',
  connectionType: 'reverse',
  
  options: {
    LHOST: {
      name: 'LHOST',
      description: 'The listen address (an interface may be specified)',
      type: 'string',
      required: true,
    },
    LPORT: {
      name: 'LPORT',
      description: 'The listen port',
      type: 'integer',
      default: '4444',
      required: false,
    },
    EXITFUNC: {
      name: 'EXITFUNC',
      description: "Exit technique (Accepted: '', seh, thread, process, none)",
      type: 'enum',
      default: 'process',
      enumValues: ['seh', 'thread', 'process', 'none'],
      required: false,
    },
  },
  
  defaultOptions: {
    LPORT: '4444',
    EXITFUNC: 'process',
  },
  
  requiredOptions: ['LHOST', 'LPORT'],
  
  generateDescription: (options): string => {
    const lhost = options.LHOST || '0.0.0.0';
    const lport = options.LPORT || '4444';
    return `reverse tcp Meterpreter shell (x86) connecting to ${lhost}:${lport}`;
  },
};

export { meterpreter_reverse_tcp_x64 as default };
