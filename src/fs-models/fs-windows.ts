// ── fs-models/fs-windows.ts ───────────────────────────────────────
// Plantilla NEUTRA de sistema de archivos Windows: estructura de
// directorios + archivos de sistema, como una instalación desde cero.
// NO contiene flags, credenciales, notas ni servicios de labo — eso lo
// agrega cada escenario en src/laboratorios/* (buildScenario dedupea
// por path y gana el último). Para tests que necesiten contenido de
// ejemplo ver src/fs-models/__fixtures__/windowsSampleFiles.ts.

import type { FileEntry } from '../types';

export interface WindowsFileSystemConfig {
  username?: string;
  computerName?: string;
}

export function createWindowsFileSystem(config: WindowsFileSystemConfig = {}): FileEntry[] {
  const u = config.username || 'Administrator';
  const pc = config.computerName || 'WIN-SERVER';
  
  return [
    // ═══════════════════════════════════════════════════════════════
    // ESTRUCTURA DE DIRECTORIOS RAÍZ
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/.dir', content: '', type: 'text' },
    { path: '/C:/Windows/.dir', content: '', type: 'text' },
    { path: '/C:/Windows/System32/.dir', content: '', type: 'text' },
    { path: '/C:/Windows/System32/drivers/.dir', content: '', type: 'text' },
    { path: '/C:/Windows/System32/config/.dir', content: '', type: 'text' },
    { path: '/C:/Program Files/.dir', content: '', type: 'text' },
    { path: '/C:/Program Files (x86)/.dir', content: '', type: 'text' },
    { path: '/C:/Users/.dir', content: '', type: 'text' },
    { path: `/C:/Users/${u}/.dir`, content: '', type: 'text', owner: u, group: u, mode: 0o755 },
    { path: `/C:/Users/${u}/Desktop/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/Documents/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/Downloads/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/Local/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/Roaming/.dir`, content: '', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // /C:/Windows/System32/ - Archivos del sistema
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/System32/drivers/etc/hosts', content: `# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.\n#\n# This file contains the mappings of IP addresses to host names. Each\n# entry should be kept on an individual line. The IP address should\n# be placed in the first column followed by the corresponding host name.\n# The IP address and the host name should be separated by at least one\n# space.\n#\n# Additionally, comments (such as these) may be inserted on individual\n# lines or following the machine name denoted by a '#' symbol.\n#\n# For example:\n#\n#      102.54.94.97     rhino.acme.com          # source server\n#       38.25.63.10     x.acme.com              # x client host\n\n# localhost name resolution is handled within DNS itself.\n#\t127.0.0.1       localhost\n#\t::1             localhost\n127.0.0.1\tlocalhost\n# ${pc}`, type: 'text' },

    { path: '/C:/Windows/System32/config/SAM', content: 'SYSTEM\\SAM\\Domains\\Account\\Users\\000001F4\nSYSTEM\\SAM\\Domains\\Account\\Users\\000001F5\nSYSTEM\\SAM\\Domains\\Account\\Users\\Names\\Administrator\nSYSTEM\\SAM\\Domains\\Account\\Users\\Names\\Guest', type: 'text', owner: 'SYSTEM', group: 'SYSTEM', mode: 0o600 },

    // ═══════════════════════════════════════════════════════════════
    // /C:/Users/ - Directorios de usuarios (sin archivos de usuario:
    // los agrega cada escenario con createFile)
    // ═══════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════
    // Archivos de configuración comunes
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/win.ini', content: '[windows]\nload=\nrun=\nNullPort=None\n\n[Desktop]\nWallpaper=(None)\nTileWallpaper=0\nWallpaperStyle=0\n\n[fonts]\n\n[extensions]\n\n[ports]\n\n[mci extensions]\n\n[files]\n\n[Mail]\nMAPI=1\nCMCDLLNAME32=mapi32.dll\nCMC=1\nMAPIX=1\nMAPIXVER=1.0.0.1\nOLEMessaging=1', type: 'text', owner: 'Administrator', group: 'Administrators', mode: 0o644 },

    { path: '/C:/Windows/System32/drivers/etc/protocol', content: '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This file contains the Internet protocols as defined by various\n# RFCs. See http://www.iana.org/assignments/protocol-numbers\n#\n# Format:\n#\n# <protocol name>  <assigned number>  [aliases...]   [# <comment>]\n\nip         0   IP           # Internet protocol, pseudo protocol number\\icmp       1   ICMP         # Internet control message protocol\ntcp        6   TCP          # Transmission control protocol\nudp        17  UDP          # User datagram protocol', type: 'text' },

    { path: '/C:/Windows/System32/drivers/etc/services', content: '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This file contains port numbers for well-known services as defined by\n# http://www.iana.org/assignments/port-numbers\n#\n# Format:\n#\n# <service name>  <port number>/<protocol>  [aliases...]   [# <comment>]\n\ntcpmux          1/tcp\nftp-data        20/tcp\nftp             21/tcp\nssh             22/tcp\ntelnet          23/tcp\nsmtp            25/tcp\nhttp            80/tcp\nhttps           443/tcp\nmicrosoft-ds    445/tcp\nmysql           3306/tcp\nms-wbt-server   3389/tcp', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // Archivos de log
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/WindowsUpdate.log', content: '2024-03-19\t10:00:01\tInfo\tWindows Update started\n2024-03-19\t10:00:02\tInfo\tChecking for updates\n2024-03-19\t10:00:05\tInfo\tNo updates available\n2024-03-19\t10:00:06\tInfo\tWindows Update completed', type: 'text', owner: 'SYSTEM', group: 'SYSTEM', mode: 0o644 },

    // Log de errores HTTP: IPs de documentación (203.0.113.x cliente,
    // 192.0.2.x servidor), nunca las del laboratorio.
    { path: '/C:/Windows/System32/LogFiles/HTTPERR/httperr1.log', content: '#Software: Microsoft HTTP API 2.0\n#Version: 1.0\n#Date: 2024-03-19 10:00:00\n#Fields: date time c-ip c-port s-ip s-port cs-version cs-method cs-uri sc-status s-siteid s-reason s-queuename\n2024-03-19 10:15:30 203.0.113.45 54321 192.0.2.10 80 HTTP/1.1 GET /admin - 401 - Unauthorized -\n2024-03-19 10:15:35 203.0.113.45 54322 192.0.2.10 80 HTTP/1.1 POST /login - 200 - OK -', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // Archivos de registro (Registry simulation)
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/System32/config/system', content: 'SYSTEM\\ControlSet001\\Control\\ComputerName\\ComputerName\nSYSTEM\\ControlSet001\\Control\\TimeZoneInformation\nSYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters\\Interfaces\nSYSTEM\\ControlSet001\\Services\\LanmanServer\\Shares', type: 'text', owner: 'SYSTEM', group: 'SYSTEM', mode: 0o600 },

    { path: '/C:/Windows/System32/config/software', content: 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\nSOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\nSOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce\nSOFTWARE\\Microsoft\\Internet Explorer', type: 'text', owner: 'SYSTEM', group: 'SYSTEM', mode: 0o600 },
  ];
}