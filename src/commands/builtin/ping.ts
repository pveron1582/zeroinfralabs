// ── commands/builtin/ping.ts ──────────────────────────────────────
// Simulador de ping ICMP
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';

const PING_HELP = `Usage: ping [options] <destination>
Options:
  -c <count>    Stop after sending <count> packets
  -i <interval> Wait <interval> seconds between packets (default: 1)
  -W <timeout>  Time to wait for response (default: 3)
  -s <size>     Packet size (default: 56 bytes)
  -h            Display this help

Examples:
  ping 192.168.1.10
  ping -c 3 192.168.1.10
  ping -c 5 -i 2 10.0.0.5`;

export const cmd_ping = {
  name: 'ping',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    // Help flag
    if (args.includes('-h') || args.includes('--help')) {
      return { output: PING_HELP };
    }

    // Parse flags
    const countIdx = args.indexOf('-c');
    const count = countIdx >= 0 ? parseInt(args[countIdx + 1], 10) : 4;
    
    const intervalIdx = args.indexOf('-i');
    const interval = intervalIdx >= 0 ? parseInt(args[intervalIdx + 1], 10) : 1;
    
    const timeoutIdx = args.indexOf('-W');
    const timeout = timeoutIdx >= 0 ? parseInt(args[timeoutIdx + 1], 10) : 3;
    
    const sizeIdx = args.indexOf('-s');
    const packetSize = sizeIdx >= 0 ? parseInt(args[sizeIdx + 1], 10) : 56;

    // Find target (first non-flag argument)
    const target = args.find((arg, idx) => {
      if (arg.startsWith('-')) return false;
      // Check if this arg is a value for a flag
      if (idx > 0 && args[idx - 1].startsWith('-')) {
        const prevFlag = args[idx - 1];
        if (['-c', '-i', '-W', '-s'].includes(prevFlag)) return false;
      }
      return true;
    });

    if (!target) {
      return { output: 'ping: usage error: Destination address required\n\n' + PING_HELP, isError: true };
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(target)) {
      return { output: `ping: ${target}: Name or service not known`, isError: true };
    }

    // Check if target exists in network
    const targetMachine = ctx.allMachines.find(m => m.machine_info.ip === target);
    
    if (!targetMachine) {
      // Host doesn't exist - simulate unreachable
      let output = `PING ${target} (${target}) ${packetSize}(${packetSize + 28}) bytes of data.\n`;
      output += `\n--- ${target} ping statistics ---\n`;
      output += `${count} packets transmitted, 0 received, 100% packet loss, time ${count * interval * 1000}ms\n`;
      return { output };
    }

    // Host exists - simulate successful pings
    let output = `PING ${target} (${target}) ${packetSize}(${packetSize + 28}) bytes of data.\n`;
    
    let received = 0;
    const times: number[] = [];
    
    for (let i = 1; i <= count; i++) {
      // Simulate variable latency (0.3-2.0ms for local network)
      const time = (Math.random() * 1.7 + 0.3).toFixed(2);
      times.push(parseFloat(time));
      
      // Simulate TTL (64 for Linux, 128 for Windows)
      const ttl = targetMachine.machine_info.os.toLowerCase().includes('windows') ? 128 : 64;
      
      output += `${packetSize + 28} bytes from ${target}: icmp_seq=${i} ttl=${ttl} time=${time} ms\n`;
      received++;
      
      // Simulate interval (only if not the last packet)
      if (i < count && interval > 0) {
        // In real ping this would wait, but for simulation we just note it
        output += '';
      }
    }

    // Statistics
    const min = Math.min(...times).toFixed(2);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const max = Math.max(...times).toFixed(2);
    const mdev = (Math.random() * 0.5 + 0.1).toFixed(3);
    
    output += `\n--- ${target} ping statistics ---\n`;
    output += `${count} packets transmitted, ${received} received, 0% packet loss, time ${count * interval * 1000}ms\n`;
    output += `rtt min/avg/max/mdev = ${min}/${avg}/${max}/${mdev} ms\n`;

    return { output };
  }
};
