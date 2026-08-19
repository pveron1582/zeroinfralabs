// ── commands/tools/nmap/ports.ts ─────────────────────────────────
// Parseo de la especificación de puertos (-p / -p-) y estado efectivo

import type { Machine, Port } from '../../../types';
import { effectivePortState } from '../../../frameworks/network/networkState';

// El nmap real por default escanea los "top 1000" puertos por frecuencia.
// Aproximación: puertos 1-1024 + puertos altos bien conocidos que aparecen
// en el top 1000 real (8080, 8443, 3306, 3389, 5432, 1433, 6379, 27017, ...).
const HIGH_TOP_PORTS = new Set([
  1433, 2049, 2222, 3000, 3128, 3306, 3389, 4443, 5000, 5432,
  5900, 6379, 8000, 8008, 8080, 8081, 8443, 8888, 9090, 27017,
]);

export function parsePorts(args: string[], target: Machine): Port[] {
  const allPorts = target.scan_results.ports || [];
  const openOnly = args.includes('--open');

  // Find -p flag: could be '-p22,80' or '-p' followed by '22,80'
  let portSpec: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p' && i + 1 < args.length) {
      portSpec = args[i + 1];
      break;
    }
    if (args[i].startsWith('-p') && args[i].length > 2) {
      portSpec = args[i].slice(2);
      break;
    }
  }

  let result: Port[];

  if (portSpec === null) {
    // Default: aprox. "top 1000" — puertos 1-1024 más puertos altos frecuentes
    result = allPorts.filter(p => (p.port >= 1 && p.port <= 1024) || HIGH_TOP_PORTS.has(p.port));
  } else if (portSpec === '-') {
    // -p- : all 65535 ports — return all ports directly
    result = [...allPorts];
  } else {
    // Parse specific ports/ranges into a Set for O(1) lookup
    const requestedPorts = new Set<number>();
    portSpec.split(',').forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            requestedPorts.add(i);
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n)) requestedPorts.add(n);
      }
    });
    result = allPorts.filter(p => requestedPorts.has(p.port));
  }

  // Estado efectivo: el firewall puede filtrar puertos (DROP/REJECT ufw
  // default-deny) y un servicio detenido marca el puerto como cerrado.
  result = result.map(p => ({ ...p, state: effectivePortState(target, p) }));

  if (openOnly) {
    result = result.filter(p => p.state === 'open');
  }

  return result.sort((a, b) => a.port - b.port);
}
