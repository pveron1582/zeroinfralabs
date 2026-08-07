// ── frameworks/packages/packageManager.ts ───────────────────────────
// Gestor de paquetes simulados (ROADMAP Fase 7.1/7.2). Mantiene el set
// de paquetes instalados POR MÁQUINA (no persistente, igual que
// ProcessManager/networkState). El set base se deriva de los binarios
// presentes en el filesystem de la máquina.

import type { Machine } from '../../types';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  size: string;
  architecture: string;
  binaries: string[];
}

// Base de datos de paquetes conocidos
export const PACKAGE_DB: Record<string, PackageInfo> = {
  bash: { name: 'bash', version: '5.2.21-2kali1', description: 'GNU Bourne Again SHell', size: '1,392 kB', architecture: 'amd64', binaries: ['/bin/bash'] },
  coreutils: { name: 'coreutils', version: '9.1-1', description: 'GNU core utilities', size: '4,288 kB', architecture: 'amd64', binaries: ['/usr/bin/ls', '/usr/bin/cat', '/usr/bin/mv', '/usr/bin/rm', '/usr/bin/cp', '/usr/bin/touch'] },
  'openssh-client': { name: 'openssh-client', version: '1:9.6p1-4', description: 'secure shell (SSH) client', size: '1,672 kB', architecture: 'amd64', binaries: ['/usr/bin/ssh', '/usr/bin/scp', '/usr/bin/sftp'] },
  'openssh-server': { name: 'openssh-server', version: '1:9.6p1-4', description: 'secure shell (SSH) server', size: '904 kB', architecture: 'amd64', binaries: ['/usr/sbin/sshd'] },
  'netcat-traditional': { name: 'netcat-traditional', version: '1.10-47', description: 'TCP/IP swiss army knife', size: '92 kB', architecture: 'amd64', binaries: ['/bin/nc'] },
  nmap: { name: 'nmap', version: '7.94-1', description: 'Network exploration tool and security scanner', size: '6,404 kB', architecture: 'amd64', binaries: ['/usr/bin/nmap'] },
  hydra: { name: 'hydra', version: '9.5-1', description: 'fast network logon cracker', size: '536 kB', architecture: 'amd64', binaries: ['/usr/bin/hydra'] },
  gobuster: { name: 'gobuster', version: '3.6-1', description: 'DNS/HTTP brute-force directory tool', size: '2,192 kB', architecture: 'amd64', binaries: ['/usr/bin/gobuster'] },
  curl: { name: 'curl', version: '8.5.0-2', description: 'command line tool for transferring data with URL syntax', size: '448 kB', architecture: 'amd64', binaries: ['/usr/bin/curl'] },
  wget: { name: 'wget', version: '1.21.4-1', description: 'retrieves files from the web', size: '1,084 kB', architecture: 'amd64', binaries: ['/usr/bin/wget'] },
  python3: { name: 'python3', version: '3.11.8-1', description: 'interactive high-level object-oriented language', size: '12,348 kB', architecture: 'amd64', binaries: ['/usr/bin/python3'] },
  vim: { name: 'vim', version: '2:9.1.0016-1', description: 'Vi IMproved - enhanced vi editor', size: '3,768 kB', architecture: 'amd64', binaries: ['/usr/bin/vim'] },
  nano: { name: 'nano', version: '7.2-1', description: 'small, friendly text editor', size: '692 kB', architecture: 'amd64', binaries: ['/usr/bin/nano'] },
  iptables: { name: 'iptables', version: '1.8.10-3', description: 'administration tools for packet filtering and NAT', size: '676 kB', architecture: 'amd64', binaries: ['/usr/sbin/iptables'] },
  ufw: { name: 'ufw', version: '0.36.2-1', description: 'program for managing a Netfilter firewall', size: '240 kB', architecture: 'amd64', binaries: ['/usr/sbin/ufw'] },
  'net-tools': { name: 'net-tools', version: '2.10-0.1', description: 'NET-3 networking toolkit', size: '364 kB', architecture: 'amd64', binaries: ['/sbin/ifconfig', '/usr/bin/netstat'] },
  iproute2: { name: 'iproute2', version: '6.7.0-1', description: 'networking and traffic control tools', size: '1,004 kB', architecture: 'amd64', binaries: ['/sbin/ip', '/usr/sbin/ss'] },
  apache2: { name: 'apache2', version: '2.4.58-1', description: 'Apache HTTP Server', size: '1,140 kB', architecture: 'amd64', binaries: ['/usr/sbin/apache2'] },
  nginx: { name: 'nginx', version: '1.24.0-2', description: 'small, powerful, scalable web server', size: '620 kB', architecture: 'amd64', binaries: ['/usr/sbin/nginx'] },
  'mysql-server': { name: 'mysql-server', version: '8.0.36-1', description: 'MySQL database server', size: '4,092 kB', architecture: 'amd64', binaries: ['/usr/bin/mysqld'] },
  vsftpd: { name: 'vsftpd', version: '3.0.6-1', description: 'lightweight, efficient FTP server', size: '136 kB', architecture: 'amd64', binaries: ['/usr/sbin/vsftpd'] },
  smbclient: { name: 'smbclient', version: '4.19.4-1', description: 'command-line SMB/CIFS clients', size: '1,052 kB', architecture: 'amd64', binaries: ['/usr/bin/smbclient'] },
  hashcat: { name: 'hashcat', version: '6.2.6+ds1-1', description: 'advanced password recovery tool', size: '14,352 kB', architecture: 'amd64', binaries: ['/usr/bin/hashcat'] },
  john: { name: 'john', version: '1.9.0-3', description: 'active password cracking tool', size: '3,104 kB', architecture: 'amd64', binaries: ['/usr/bin/john'] },
  git: { name: 'git', version: '1:2.43.0-1', description: 'fast, scalable, distributed revision control system', size: '7,948 kB', architecture: 'amd64', binaries: ['/usr/bin/git'] },
  'metasploit-framework': { name: 'metasploit-framework', version: '6.3.59-1kali1', description: 'advanced open-source platform for penetration testing', size: '48,392 kB', architecture: 'amd64', binaries: ['/usr/bin/msfconsole'] },
};

// ── Estado por máquina (no persistente) ─────────────────────────────
const installed = new Map<string, Set<string>>();

function installedSet(machine: Machine): Set<string> {
  let s = installed.get(machine.id);
  if (!s) {
    s = new Set(
      Object.keys(PACKAGE_DB).filter(name =>
        PACKAGE_DB[name].binaries.some(bin => machine.files?.some(f => f.path === bin))
      )
    );
    installed.set(machine.id, s);
  }
  return s;
}

export function getPackage(name: string): PackageInfo | undefined {
  return PACKAGE_DB[name];
}

export function searchPackages(term: string): PackageInfo[] {
  const t = term.toLowerCase();
  return Object.values(PACKAGE_DB)
    .filter(p => p.name.includes(t) || p.description.toLowerCase().includes(t))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listInstalled(machine: Machine): PackageInfo[] {
  return Array.from(installedSet(machine))
    .map(name => PACKAGE_DB[name])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function isInstalled(machine: Machine, name: string): boolean {
  return installedSet(machine).has(name);
}

export function installPackage(machine: Machine, name: string): boolean {
  if (!PACKAGE_DB[name]) return false;
  installedSet(machine).add(name);
  return true;
}

export function removePackage(machine: Machine, name: string): boolean {
  if (!PACKAGE_DB[name]) return false;
  installedSet(machine).delete(name);
  return true;
}

export function resetPackageManager(): void {
  installed.clear();
}
