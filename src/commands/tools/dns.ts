// ── commands/tools/dns.ts ─────────────────────────────────────────
// dig y nslookup (Tier 1): DNS contra el DNS virtual de la red —
// los hostnames de las máquinas son los únicos resolvibles.

import type { CommandContext, CommandResponse, Machine } from '../../types';

function resolveHost(ctx: CommandContext, name: string): Machine | null {
  const norm = name.toLowerCase().replace(/\.$/, '');
  return ctx.allMachines.find(m =>
    m.machine_info.hostname.toLowerCase() === norm ||
    m.machine_info.ip === norm
  ) ?? null;
}

const NAMESERVER = '10.0.2.3';

function soaBlock(): string {
  const now = virtual();
  return [
    `${NAMESERVER}.	10800	IN	SOA	nameserver.${NAMESERVER}. hostmaster. ${now} 3600 600 604800 300`,
  ].join('\n');
}

function virtual(): number {
  return Math.floor(Date.now() / 1000);
}

export const cmd_dig = {
  name: 'dig',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const plain = args.filter(a => !a.startsWith('-') && !a.startsWith('+')).filter(a => a !== 'IN');
    const rtype = /^(A|NS|CNAME|MX|TXT|SOA|PTR)$/i.test(plain[plain.length - 1] ?? '') ? plain.pop()!.toUpperCase() : 'A';
    // dig [@server] <name> [type] — ignoramos el servidor si viene
    const name = plain.find(a => !a.startsWith('@'));
    if (!name) return { output: 'Usage: dig [@server] <name> [type]\nTypes: A, NS, CNAME, MX, TXT, PTR', isError: true };

    // dig +short devuelve solo el resultado
    const short = args.includes('+short');
    const target = resolveHost(ctx, name);

    // Reverso: dig -x IP
    if (args.includes('-x')) {
      const t = resolveHost(ctx, name);
      if (!t) return { output: `** ${name} (...): not found`, isError: true };
      const ptr = `${name.split('.').reverse().join('.')}.in-addr.arpa.${' '.repeat(0)} 300 INV"PTR ${t.machine_info.hostname}.`;
      return { output: ptr.includes('INV') ? `;; ->>HEADER<<- opcode: QUERY, status: NOERROR\n;; ANSWER SECTION:\n${name.split('.').reverse().join('.')}.in-addr.arpa. 300\tIN\tPTR\t${t.machine_info.hostname}.` : ptr };
    }

    if (short) {
      if (!target) return { output: '', isError: true };
      if (rtype === 'A') return { output: target.machine_info.ip };
      if (rtype === 'CNAME') return { output: `${target.machine_info.hostname}.` };
      return { output: target.machine_info.ip };
    }

    const header = `; <<>> DiG 9.18.24-1-Debian <<>> ${args.join(' ')}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: ${target ? 'NOERROR' : 'NXDOMAIN'}, id: ${(Math.abs(hash(name)) % 60000 + 1000)}
;; flags: qr aa rd ra; QUERY: 1, ANSWER: ${target ? 1 : 0}, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${name}.			IN	${rtype}
`;
    if (!target) {
      return { output: `${header}\n;; AUTHORITY SECTION:\n${soaBlock()}`, isError: true };
    }

    let answer = '';
    if (rtype === 'A') answer = `${name}.	300	IN	A	${target.machine_info.ip}`;
    else if (rtype === 'NS') answer = `${name}.	300	IN	NS	ns1.${name}.`;
    else if (rtype === 'CNAME') answer = `${name}.	300	IN	CNAME	${target.machine_info.hostname}.`;
    else if (rtype === 'MX') answer = `${name}.	300	IN	MX	10 mail.${name}.`;
    else if (rtype === 'TXT') answer = `${name}.	300	IN	TXT	"v=spf1 a mx ip4:${target.machine_info.ip} ~all"`;
    else if (rtype === 'PTR') answer = `${target.machine_info.ip.split('.').reverse().join('.')}.in-addr.arpa. 300 IN PTR ${target.machine_info.hostname}.`;
    else answer = `${name}.	300	IN	SOA	${NAMESERVER}. hostmaster.${name}. ${virtual()} 3600 600 604800 300`;

    return { output: `${header}\n;; ANSWER SECTION:\n${answer}\n\n;; Query time: ${Math.floor(Math.random() * 30) + 5} msec\n;; SERVER: ${NAMESERVER}#53(${NAMESERVER}) (UDP)\n;; MSG SIZE  rcvd: 64` };
  },
};

export const cmd_nslookup = {
  name: 'nslookup',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const name = rest[0];
    if (!name) return { output: 'Usage: nslookup <name>\n       nslookup <ip> (reverse)', isError: true };

    const ipMatch = /^\d+\.\d+\.\d+\.\d+$/.test(name);
    const target = resolveHost(ctx, name);
    if (!target) {
      return { output: `Server:		${NAMESERVER}\nAddress:	${NAMESERVER}#53\n\n** server can't find ${name}: NXDOMAIN`, isError: true };
    }
    if (ipMatch) {
      const ptr = `${name.split('.').reverse().join('.')}.in-addr.arpa`;
      return { output: `Server:		${NAMESERVER}\nAddress:	${NAMESERVER}#53\n\nNon-authoritative answer:\n${ptr}	name = ${target.machine_info.hostname}.` };
    }
    return { output: `Server:		${NAMESERVER}\nAddress:	${NAMESERVER}#53\n\nNon-authoritative answer:\nName:	${target.machine_info.hostname}\nAddress: ${target.machine_info.ip}` };
  },
};

function hash(s: string): number {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
