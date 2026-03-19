// ── utils/network.ts ──────────────────────────────────────────────
// Network utilities: IP assignment, network calculations, etc.

import type { Machine } from '../types';

// ── Realistic private IP ranges by class ──────────────────────────
const IP_RANGES = [
  // Class A: 10.0.0.0/8 (needs subnet.host)
  { prefix: '10', subnets: [1, 2, 3], min: 1, max: 254, class: 'A' },
  // Class B: 172.16.0.0/12
  { prefix: '172.16', subnets: null, min: 1, max: 254, class: 'B' },
  { prefix: '172.17', subnets: null, min: 1, max: 254, class: 'B' },
  { prefix: '172.18', subnets: null, min: 1, max: 254, class: 'B' },
  // Class C: 192.168.0.0/16
  { prefix: '192.168.1', subnets: null, min: 1, max: 254, class: 'C' },
  { prefix: '192.168.2', subnets: null, min: 1, max: 254, class: 'C' },
  { prefix: '192.168.100', subnets: null, min: 1, max: 254, class: 'C' },
];

/**
 * Seeded random number generator - reproducible
 * Using scenario ID as seed for consistent IPs per session
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Generates a random private IP address from realistic ranges
 * Reproducible per scenario ID to ensure same IPs per session
 */
export function generateRandomIP(scenarioId: string, machineIndex: number): string {
  const rng = seededRandom(`${scenarioId}-machine-${machineIndex}`);
  const rangeIndex = Math.floor(rng() * IP_RANGES.length);
  const range = IP_RANGES[rangeIndex];
  
  if (!range || range.max === undefined || range.min === undefined) {
    // Fallback a IP simple si hay error
    return `192.168.1.${(machineIndex % 254) + 1}`;
  }
  
  const hostNum = Math.floor(rng() * (range.max - range.min + 1)) + range.min;
  
  // Para Clase A, necesitamos agregar un octeto de subnet
  if (range.subnets && range.subnets.length > 0) {
    const subnet = range.subnets[Math.floor(rng() * range.subnets.length)];
    return `${range.prefix}.${subnet}.${hostNum}`;
  }
  
  return `${range.prefix}.${hostNum}`;
}

/**
 * Assigns random private IPs to machines, one per machine
 * IPs are unique per machine and reproducible per scenario
 * Skips machines that already have IPs defined
 */
export function assignDynamicIPs(scenarioId: string, machines: Machine[]): Machine[] {
  try {
    const usedIPs = new Set<string>();
    
    return machines.map((machine, index) => {
      // Si ya tiene IP, no la cambiamos
      if (machine.machine_info.ip && machine.machine_info.ip.length > 0) {
        usedIPs.add(machine.machine_info.ip);
        return machine;
      }
      
      // Generar IP aleatoria hasta encontrar una no usada
      let ip: string;
      let attempts = 0;
      do {
        ip = generateRandomIP(scenarioId, index + attempts * 1000);
        attempts++;
      } while (usedIPs.has(ip) && attempts < 100);
      
      usedIPs.add(ip);
      
      return {
        ...machine,
        machine_info: {
          ...machine.machine_info,
          ip,
        },
      };
    });
  } catch (error) {
    console.error('Error in assignDynamicIPs:', error);
    // Fallback: retorna machines sin modificar
    return machines;
  }
}

/**
 * Legacy function: assign sequential IPs from network range
 * Kept for backwards compatibility but prefer assignDynamicIPs()
 */
export const assignDHCP = (networkRange: string, machines: Machine[]): Machine[] => {
  const baseIp = networkRange.split('/')[0].split('.').slice(0, 3).join('.');
  let host = 10;
  return machines.map(m => ({
    ...m,
    machine_info: { ...m.machine_info, ip: `${baseIp}.${host++}` }
  }));
};
