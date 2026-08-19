// ── commands/tools/nmap/scripts.ts ────────────────────────────────
// Simulación de scripts NSE básicos para el modo agresivo (-A).
// El nmap real corre el set de scripts por defecto; acá emitimos los
// más informativos (smb-os-discovery, http-title, http-server-header)
// basados en los servicios abiertos de la máquina objetivo.

import type { Port, Machine } from '../../../types';

/** Genera el bloque "Host script results:" o null si ningún script aplica. */
export function buildHostScriptResults(target: Machine, openPorts: Port[]): string | null {
  const lines: string[] = [];
  const osIsWindows = target.machine_info.os.toLowerCase().includes('windows');

  if (osIsWindows && openPorts.some(p => p.port === 445 || p.port === 139)) {
    lines.push('| smb-os-discovery:');
    lines.push(`|   OS: ${target.machine_info.os}`);
    lines.push(`|   Computer name: ${target.machine_info.hostname.toLowerCase()}`);
    lines.push(`|_  System time: ${new Date().toLocaleString()}`);
  }

  const webPort = openPorts.find(p => p.service === 'http' || p.service === 'https');
  if (webPort) {
    const serverHeader = webPort.version || target.web_enumeration?.web_server || 'Apache';
    lines.push('|_http-server-header: ' + serverHeader);
    const cms = target.web_enumeration?.cms;
    const title = cms && cms !== 'none'
      ? `${target.machine_info.hostname} — ${cms}`
      : target.machine_info.hostname;
    lines.push(`| http-title: ${title}`);
    lines.push('|_Requested resource was /');
  }

  if (lines.length === 0) return null;
  return 'Host script results:\n' + lines.join('\n') + '\n';
}
