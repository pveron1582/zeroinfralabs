// ── commands/tools/nmap/vendors.ts ────────────────────────────────
// Lookup de vendor por prefijo MAC (OUI) para los reportes de nmap

const VENDORS: Record<string, string> = {
  '08:00:27': 'PCS Systemtechnik GmbH (VirtualBox)',
  '00:0C:29': 'VMware',
  '52:54:00': 'QEMU',
  '00:15:5D': 'Microsoft Hyper-V',
};

export function getVendor(mac: string): string {
  const prefix = mac.slice(0, 8).toUpperCase();
  return VENDORS[prefix] || 'Unknown';
}
