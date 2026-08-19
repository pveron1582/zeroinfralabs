// ── commands/tools/nmap/flags.ts ─────────────────────────────────
// Parseo de flags de línea de comandos de nmap

export interface NmapScanFlags {
  scanType: string;
  isPingScan: boolean;
  isVersionScan: boolean;
  isSYNScan: boolean;
  vLevel: number;
  osDetect: boolean;
  noPing: boolean;
  aggressive: boolean;
  outputFileNormal: string | null;
  outputFileGrep: string | null;
}

/** Extrae la especificación de target (IP simple o CIDR) de los args. */
export function extractTargetSpec(args: string[]): string | undefined {
  return args.find(a => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(a));
}

export function parseFlags(args: string[]): NmapScanFlags {
  const scanTypes = ['-sS', '-sT', '-sn', '-sP'];
  const scanType = args.find(a => scanTypes.includes(a)) || '-sS';

  // Output files
  const oNIdx = args.indexOf('-oN');
  const oGIdx = args.indexOf('-oG');

  return {
    scanType,
    isPingScan: scanType === '-sn' || scanType === '-sP',
    // -A en el nmap real implica -sV + -O + scripts NSE
    isVersionScan: args.includes('-sV') || args.includes('-A'),
    isSYNScan: scanType === '-sS',
    vLevel: args.includes('-vvv') ? 3 : args.includes('-vv') ? 2 : args.includes('-v') ? 1 : 0,
    osDetect: args.includes('-O'),
    noPing: args.includes('-Pn'),
    aggressive: args.includes('-A'),
    outputFileNormal: oNIdx >= 0 ? args[oNIdx + 1] : null,
    outputFileGrep: oGIdx >= 0 ? args[oGIdx + 1] : null,
  };
}
