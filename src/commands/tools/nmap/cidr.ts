// ── commands/tools/nmap/cidr.ts ──────────────────────────────────
// Aritmética de redes CIDR para escaneos sobre rangos de IPs

export function ipToNumber(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

export function parseCidr(cidr: string): { network: number; mask: number } | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;

  const maskBits = parseInt(parts[1], 10);
  if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) return null;

  const ipNum = ipToNumber(parts[0]);
  if (ipNum === null) return null;

  return { network: ipNum & (-1 << (32 - maskBits)), mask: maskBits };
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  const parsed = parseCidr(cidr);
  if (!parsed) return false;

  const ipNum = ipToNumber(ip);
  if (ipNum === null) return false;

  const maskBits = -1 << (32 - parsed.mask);
  return (ipNum & maskBits) === parsed.network;
}
