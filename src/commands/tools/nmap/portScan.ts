// ── commands/tools/nmap/portScan.ts ──────────────────────────────
// Escaneo completo de puertos (-sS/-sT ± -sV/-O/-A) sobre una IP única

import type { CommandContext, CommandResponse, Machine } from '../../../types';
import { getVendor } from './vendors';
import { parsePorts } from './ports';
import { createNmapFileWriter } from './outfiles';
import { buildHostScriptResults } from './scripts';
import type { NmapScanFlags } from './flags';

export function performPortScan(
  target: Machine,
  ip: string,
  args: string[],
  flags: NmapScanFlags,
  ctx: CommandContext
): CommandResponse {
  const { isSYNScan, isVersionScan, isUdpScan, vLevel, osDetect, noPing, aggressive, script, timing, outputFileNormal, outputFileGrep, outputFileXml, outputFileAll } = flags;

  const ports = parsePorts(args, target);

  const scanLabel = isUdpScan ? 'UDP Scan' : isSYNScan ? 'SYN Stealth Scan' : 'Connect Scan';
  const scanTime = (ports.length * 0.02 + 0.5).toFixed(2);
  const attackerIp = ctx.machine?.machine_info?.ip || '192.168.1.5';
  const timingLabel = timing ? ` (timing: T${timing})` : '';

  let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;

  if (vLevel >= 1) {
    output += `Initiating ${scanLabel} at ${new Date().toLocaleTimeString()}\n`;
  }

  if (isSYNScan && vLevel === 0) {
    output += `Scanning ${target.machine_info.hostname} (${ip}) [1 host] - ${scanLabel}${timingLabel}\n`;
  }

  if (timing && vLevel >= 1) {
    output += `Timing template: T${timing}\n`;
  }

  if (noPing && vLevel >= 1) {
    output += `Skipping host discovery (-Pn)\n`;
  }

  output += `Nmap scan report for ${target.machine_info.hostname} (${ip})\n`;
  output += `Host is up (0.0045s latency).\n`;
  // Same subnet: el nmap real muestra la MAC sin necesidad de -v
  output += `MAC Address: ${target.machine_info.mac} (${getVendor(target.machine_info.mac)})\n`;
  output += `\n`;

  // ── Port results ──
  const openPorts = ports.filter(p => p.state === 'open');
  const filteredPorts = ports.filter(p => p.state === 'filtered');
  const closedPorts = ports.filter(p => p.state === 'closed');

  // Determine if ports were explicitly specified with -p
  const portsExplicit = args.some(a => a === '-p' || a.startsWith('-p'));

  const showFiltered = vLevel >= 1 || args.includes('-p-');
  const showClosed = portsExplicit && closedPorts.length > 0 && closedPorts.length <= 20;
  const notShown = ports.length - openPorts.length - (showFiltered ? filteredPorts.length : 0) - (showClosed ? closedPorts.length : 0);
  if (notShown > 0) {
    output += `Not shown: ${notShown} closed port${notShown > 1 ? 's' : ''}\n`;
  }

  if (isVersionScan) {
    output += 'PORT      STATE    SERVICE     VERSION\n';
  } else {
    output += 'PORT      STATE    SERVICE\n';
  }

  // Display UDP: el modelo virtual solo conoce servicios TCP, así que un -sU
  // muestra los puertos conocidos como <puerto>/udp en estado ambiguo
  // open|filtered (comportamiento clásico del nmap real en UDP).
  // La metadata scanResults NO cambia: sigue con datos TCP para el validador.
  const dispProto = (p: { protocol: string }) => (isUdpScan ? 'udp' : p.protocol);
  const dispState = (p: { state: string }) => (isUdpScan && p.state === 'open' ? 'open|filtered' : p.state);
  const allShown = [...openPorts, ...filteredPorts, ...closedPorts];
  const stateWidth = Math.max(9, ...allShown.map(p => dispState(p).length));
  // TCP conserva el layout histórico (pad 9); UDP necesita +2 para que
  // 'open|filtered' no quede pegado al servicio.
  const statePad = (s: string) => s.padEnd(isUdpScan ? stateWidth + 2 : 9);

  // Open ports always shown
  openPorts.forEach(p => {
    const portStr = `${p.port}/${dispProto(p)}`.padEnd(10);
    const stateStr = statePad(dispState(p));
    const svcStr = p.service.padEnd(12);
    output += isVersionScan
      ? `${portStr}${stateStr}${svcStr}${p.version}\n`
      : `${portStr}${stateStr}${svcStr}\n`;
  });

  // Filtered ports: shown with -v OR when -p- is used
  if (showFiltered && filteredPorts.length > 0) {
    filteredPorts.forEach(p => {
      const portStr = `${p.port}/${dispProto(p)}`.padEnd(10);
      const stateStr = statePad(dispState(p));
      output += `${portStr}${stateStr}${p.service}\n`;
    });
  }

  // Closed ports: shown individually when explicitly requested with -p
  if (showClosed) {
    closedPorts.forEach(p => {
      const portStr = `${p.port}/${dispProto(p)}`.padEnd(10);
      const stateStr = statePad(dispState(p));
      output += `${portStr}${stateStr}${p.service}\n`;
    });
  }

  // ── OS Detection (-O) ──
  if (osDetect || aggressive) {
    output += `\n`;
    if (vLevel >= 1) output += `Initiating OS detection at ${new Date().toLocaleTimeString()}\n`;
    output += `Device type: ${target.machine_info.type === 'workstation' ? 'general purpose' : target.machine_info.type}\n`;
    const osBase = target.machine_info.os.split(' ')[0];
    const osNum = target.machine_info.os.includes('7') ? '7' : target.machine_info.os.includes('20') ? '20' : target.machine_info.os.includes('22') ? '22' : '';
    output += `Running: ${osBase} ${osNum}\n`;
    output += `OS CPE: cpe:/o:${target.machine_info.os.toLowerCase().includes('windows') ? 'microsoft' : 'canonical'}:${target.machine_info.os.toLowerCase().includes('windows') ? 'windows' : 'ubuntu_linux'}\n`;
    output += `OS details: ${target.machine_info.os}\n`;
    if (vLevel >= 2) {
      output += `Network Distance: 1 hops\n`;
      output += `TCP Sequence Prediction: Difficulty=256 (Good luck!)\n`;
      output += `IP ID Sequence Generation: Incremental\n`;
    }
  }

  // ── NSE scripts (--script / -sC) ──
  const effectiveScript = script || (aggressive ? 'default' : null);
  if (effectiveScript) {
    const scriptResults = buildHostScriptResults(target, openPorts);
    if (scriptResults) {
      output += `\nHost script results (${effectiveScript}):\n${scriptResults.replace('Host script results:\n', '')}`;
    } else {
      output += `\nNSE: Script '${effectiveScript}' completed (no results).\n`;
    }
  }

  // ── Aggressive mode (-A): Service Info ──
  if (aggressive) {
    output += `Service Info: OS: ${target.machine_info.os.split(' ')[0]}\n`;
  }

  // ── Verbose timing & stats ──
  if (vLevel >= 3) {
    output += `\n`;
    openPorts.slice(0, 3).forEach(p => {
      const sport = Math.floor(Math.random() * 50000 + 10000);
      output += `SENT (${(Math.random() * 0.01).toFixed(4)}s) TCP ${attackerIp}:${sport} > ${ip}:${p.port} S\n`;
      output += `RCVD (${(Math.random() * 0.01 + 0.001).toFixed(4)}s) TCP ${ip}:${p.port} > ${attackerIp}:${sport} SA\n`;
    });
    output += `\n`;
  }

  output += `\nNmap done: 1 IP address (1 host up) scanned in ${scanTime} seconds\n`;

  // ── Build output files ──
  // Use current directory from context (defaults to /root if not set)
  const currentDir = ctx.currentDir || '/root';
  const writer = createNmapFileWriter(ctx, currentDir);

  if (outputFileNormal) {
    writer.tryAddCreatedFile(outputFileNormal, output);
  }

  if (outputFileGrep) {
    let grepOutput = `# Nmap ${new Date().toLocaleString()} scan initiated with ${args.join(' ')}\n`;
    openPorts.forEach(p => {
      grepOutput += `Host: ${ip} (${target.machine_info.hostname})\tPorts: ${p.port}/${p.state}/${p.protocol}//${p.service}//${isVersionScan ? p.version : ''}\n`;
    });
    writer.tryAddCreatedFile(outputFileGrep, grepOutput);
  }

  if (outputFileXml) {
    let xmlOutput = `<?xml version="1.0"?>\n<nmaprun scanner="nmap" args="${args.join(' ')}">\n  <host><address addr="${ip}" addrtype="ipv4"/>\n    <ports>\n`;
    openPorts.forEach(p => {
      xmlOutput += `      <port protocol="${p.protocol}" portid="${p.port}"><state state="${p.state}"/><service name="${p.service}" product="${p.version || ''}"/></port>\n`;
    });
    xmlOutput += `    </ports>\n  </host>\n</nmaprun>\n`;
    writer.tryAddCreatedFile(outputFileXml, xmlOutput);
  }

  if (outputFileAll) {
    writer.tryAddCreatedFile(outputFileAll + '.nmap', output);
    let grepAll = `# Nmap ${new Date().toLocaleString()} scan initiated with ${args.join(' ')}\n`;
    openPorts.forEach(p => {
      grepAll += `Host: ${ip} (${target.machine_info.hostname})\tPorts: ${p.port}/${p.state}/${p.protocol}//${p.service}\n`;
    });
    writer.tryAddCreatedFile(outputFileAll + '.gnmap', grepAll);
    let xmlAll = `<?xml version="1.0"?>\n<nmaprun scanner="nmap" args="${args.join(' ')}"><host><address addr="${ip}"/><ports>`;
    openPorts.forEach(p => { xmlAll += `<port protocol="${p.protocol}" portid="${p.port}"/>`; });
    xmlAll += `</ports></host></nmaprun>\n`;
    writer.tryAddCreatedFile(outputFileAll + '.xml', xmlAll);
  }

  // ── Update discovery level ──
  target.discovery_level = Math.max(target.discovery_level ?? 0, 2);

  if (writer.createdFileErrors.length > 0) {
    output += '\n' + writer.createdFileErrors.join('\n') + '\n';
  }

  const outputLines = output.split('\n');
  const response: CommandResponse = {
    output,
    type: 'scan',
    streamingLineDelays: outputLines.map((line, idx) => {
      if (line.startsWith('Starting') || line.startsWith('Nmap done')) return 30 + Math.random() * 30;
      if (line.startsWith('Initiating') || line.startsWith('Scanning') || line.startsWith('Skipping')) return 80 + Math.random() * 60;
      if (line.startsWith('SENT') || line.startsWith('RCVD')) return 150 + Math.random() * 100;
      if (line.startsWith('|_')) return 60 + Math.random() * 40;
      if (line.match(/^\d+\/\w+\s+(open|filtered|closed)/)) return 50 + Math.random() * 60;
      if (idx === outputLines.length - 1) return 40 + Math.random() * 40;
      return 40 + Math.random() * 50;
    }),
    // Metadata para que el laboratorio valide
    scanResults: {
      targetId: target.id,
      targetIp: ip || '',
      targetHostname: target.machine_info.hostname,
      ports: openPorts.map(p => ({
        port: p.port,
        protocol: p.protocol,
        state: p.state,
        service: p.service,
        version: p.version
      })),
      osDetected: osDetect || aggressive ? target.machine_info.os : undefined,
    },
    discoveredPorts: target.id,
  };

  if (writer.createdFiles.length > 0) {
    response.createdFiles = writer.createdFiles;
  }

  return response;
}
