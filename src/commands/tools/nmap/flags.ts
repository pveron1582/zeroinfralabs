// ── commands/tools/nmap/flags.ts ─────────────────────────────────
// Parseo de flags de línea de comandos de nmap

export interface NmapScanFlags {
  scanType: string;
  isPingScan: boolean;
  isVersionScan: boolean;
  isSYNScan: boolean;
  isUdpScan: boolean;
  vLevel: number;
  osDetect: boolean;
  noPing: boolean;
  aggressive: boolean;
  script: string | null;
  timing: string | null;
  fastMode: boolean;
  topPorts: number | null;
  outputFileNormal: string | null;
  outputFileGrep: string | null;
  outputFileXml: string | null;
  outputFileAll: string | null;
}

/** Extrae la especificación de target (IP simple o CIDR) de los args. */
export function extractTargetSpec(args: string[]): string | undefined {
  return args.find(a => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(a));
}

export function parseFlags(args: string[]): NmapScanFlags {
  const scanTypes = ['-sS', '-sT', '-sn', '-sP', '-sU'];
  const scanType = args.find(a => scanTypes.includes(a)) || '-sS';

  // Output files
  const oNIdx = args.indexOf('-oN');
  const oGIdx = args.indexOf('-oG');
  const oXIdx = args.indexOf('-oX');
  const oAIdx = args.indexOf('-oA');

  // --script / -sC
  const scriptArg = args.find(a => a.startsWith('--script'));
  let script: string | null = null;
  if (scriptArg) {
    const eqIdx = scriptArg.indexOf('=');
    script = eqIdx !== -1 ? scriptArg.slice(eqIdx + 1) : (args[args.indexOf(scriptArg) + 1] ?? 'default');
  } else if (args.includes('-sC')) {
    script = 'default';
  }

  // -T timing template
  const timingArg = args.find(a => /^-T[0-5]$/.test(a));
  const timing = timingArg ? timingArg.slice(2) : null;

  // --top-ports
  let topPorts: number | null = null;
  const topIdx = args.indexOf('--top-ports');
  if (topIdx !== -1) topPorts = parseInt(args[topIdx + 1], 10) || null;
  // also support --top-ports=100
  const topEq = args.find(a => a.startsWith('--top-ports='));
  if (topEq) topPorts = parseInt(topEq.split('=')[1], 10) || null;

  return {
    scanType,
    isPingScan: scanType === '-sn' || scanType === '-sP',
    // -A en el nmap real implica -sV + -O + scripts NSE
    isVersionScan: args.includes('-sV') || args.includes('-A'),
    isSYNScan: scanType === '-sS',
    isUdpScan: args.includes('-sU'),
    vLevel: args.includes('-vvv') ? 3 : args.includes('-vv') ? 2 : args.includes('-v') ? 1 : 0,
    osDetect: args.includes('-O'),
    noPing: args.includes('-Pn'),
    aggressive: args.includes('-A'),
    script,
    timing,
    fastMode: args.includes('-F'),
    topPorts,
    outputFileNormal: oNIdx >= 0 ? args[oNIdx + 1] : null,
    outputFileGrep: oGIdx >= 0 ? args[oGIdx + 1] : null,
    outputFileXml: oXIdx >= 0 ? args[oXIdx + 1] : null,
    outputFileAll: oAIdx >= 0 ? args[oAIdx + 1] : null,
  };
}
