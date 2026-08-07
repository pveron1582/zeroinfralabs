// ── hooks/streamingConfig.ts ───────────────────────────────────────
// Configuración de delays para salida animada línea-por-línea de comandos
// (nmap, hydra, gobuster, etc). Extraído de useCommandRunner.

export interface StreamingConfig {
  lineDelay: number;
  minTotal: number;
}

export const CMD_DELAYS: Record<string, StreamingConfig> = {
  'arp-scan': { lineDelay: 55, minTotal: 800  },
  'nmap':     { lineDelay: 70, minTotal: 1200 },
  'gobuster': { lineDelay: 40, minTotal: 1500 },
  'hydra':    { lineDelay: 50, minTotal: 2000 },
  'ssh':      { lineDelay: 0,  minTotal: 500  },
  'default':  { lineDelay: 0,  minTotal: 0    },
};

/** Devuelve la config de streaming para un comando dado. */
export function getStreamingConfig(cmdName: string): StreamingConfig {
  return CMD_DELAYS[cmdName] || CMD_DELAYS['default'];
}

/** Calcula el delay total de una animación de streaming. */
export function computeTotalDelay(
  lines: string[],
  cfg: StreamingConfig,
  customDelays?: number[]
): number {
  if (customDelays && customDelays.length > 0) {
    return customDelays.reduce((a, b) => a + b, 0);
  }
  return Math.max(cfg.minTotal, lines.length * 42 + 200);
}

/** Decide si el resultado debe renderizarse con streaming. */
export function shouldStream(cfg: StreamingConfig, customDelays?: number[]): boolean {
  return cfg.minTotal > 0 || (customDelays !== undefined && customDelays.length > 0);
}
