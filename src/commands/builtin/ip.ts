// ── commands/builtin/ip.ts ──────────────────────────────────────────
// Simulador del comando 'ip' (ROADMAP Fase 6.3): ip addr, ip link, ip route.
// Refleja el estado real de las interfaces (down/up) vía networkState.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { isInterfaceDown, setInterfaceDown } from '../../frameworks/network/networkState';

const IP_HELP = `Usage: ip [OPTIONS] OBJECT
Objects:
  addr (a)    Show IP addresses on interfaces
  link (l)    Show/manage network interfaces
  route (r)   Show routing table

Commands:
  ip addr
  ip link show
  ip link set <iface> up|down
  ip route

Examples:
  ip addr
  ip link set eth0 down
  ip route`;

export const cmd_ip = {
  name: 'ip',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (!args.length || args.includes('-h') || args.includes('--help')) {
      return { output: IP_HELP, isError: !args.length };
    }

    const obj = args.find(a => !a.startsWith('-')) || '';
    const { ip, mac } = machine.machine_info;
    const user = getCurrentUser(machine);

    if (obj === 'addr' || obj === 'a' || obj === 'address') {
      return { output: addrOutput(ip, mac, machine.id) };
    }

    if (obj === 'route' || obj === 'r') {
      const net = ip.split('.').slice(0, 3).join('.');
      return {
        output: `default via ${net}.1 dev eth0\n${net}.0/24 dev eth0 proto kernel scope link src ${ip}`,
      };
    }

    if (obj === 'link' || obj === 'l') {
      const setIdx = args.indexOf('set');
      if (setIdx >= 0) {
        const iface = args[setIdx + 1];
        const stateArg = args[setIdx + 2];
        if (!isRoot(user)) return { output: `ip: RTNETLINK answers: Operation not permitted`, isError: true };
        if (iface && (stateArg === 'down' || stateArg === 'up')) {
          setInterfaceDown(machine.id, iface, stateArg === 'down');
          return { output: stateArg === 'down' ? `eth0: link down` : `eth0: link up` };
        }
        return { output: 'Usage: ip link set <interface> up|down', isError: true };
      }
      return { output: linkOutput(mac, machine.id) };
    }

    return { output: `ip: unknown object '${obj}'`, isError: true };
  }
};

function addrOutput(ip: string, mac: string, machineId: string): string {
  const net = ip.split('.').slice(0, 3).join('.');
  const ethDown = isInterfaceDown(machineId, 'eth0');
  const ethFlags = ethDown ? '<BROADCAST,MULTICAST>' : '<BROADCAST,MULTICAST,UP>';
  return `1: lo: <LOOPBACK,UP> mtu 65536 qdisc noqueue state UNKNOWN group default
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: ${ethFlags} mtu 1500 qdisc fq_codel state ${ethDown ? 'DOWN' : 'UP'} group default qlen 1000
    inet ${ip}/24 brd ${net}.255 scope global eth0
       valid_lft forever preferred_lft forever
    ether ${mac} brd ff:ff:ff:ff:ff:ff`;
}

function linkOutput(mac: string, machineId: string): string {
  const ethDown = isInterfaceDown(machineId, 'eth0');
  const loDown = isInterfaceDown(machineId, 'lo');
  return `1: lo: <LOOPBACK${loDown ? '' : ',UP'}> mtu 65536 qdisc noqueue state ${loDown ? 'DOWN' : 'UNKNOWN'} mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST${ethDown ? '' : ',UP'}> mtu 1500 qdisc fq_codel state ${ethDown ? 'DOWN' : 'UP'} mode DEFAULT group default qlen 1000
    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`;
}
