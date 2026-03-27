// ── fs-models/fs-windows.ts ───────────────────────────────────────
// Modelo de sistema de archivos Windows para laboratorios
// Este archivo contiene la estructura base de un sistema Windows
// que se puede usar como template para diferentes escenarios

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
    { path: `/C:/Users/${u}/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/Desktop/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/Documents/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/Downloads/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/Local/.dir`, content: '', type: 'text' },
    { path: `/C:/Users/${u}/AppData/Roaming/.dir`, content: '', type: 'text' },
    { path: '/C:/inetpub/.dir', content: '', type: 'text' },
    { path: '/C:/inetpub/wwwroot/.dir', content: '', type: 'text' },
    { path: '/C:/xampp/.dir', content: '', type: 'text' },
    { path: '/C:/xampp/htdocs/.dir', content: '', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // /C:/Windows/System32/ - Archivos del sistema
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/System32/drivers/etc/hosts', content: `# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.\n#\n# This file contains the mappings of IP addresses to host names. Each\n# entry should be kept on an individual line. The IP address should\n# be placed in the first column followed by the corresponding host name.\n# The IP address and the host name should be separated by at least one\n# space.\n#\n# Additionally, comments (such as these) may be inserted on individual\n# lines or following the machine name denoted by a '#' symbol.\n#\n# For example:\n#\n#      102.54.94.97     rhino.acme.com          # source server\n#       38.25.63.10     x.acme.com              # x client host\n\n# localhost name resolution is handled within DNS itself.\n#\t127.0.0.1       localhost\n#\t::1             localhost\n127.0.0.1\tlocalhost\n${pc}\t192.168.1.10`, type: 'text' },

    { path: '/C:/Windows/System32/config/SAM', content: 'SYSTEM\\SAM\\Domains\\Account\\Users\\000001F4\nSYSTEM\\SAM\\Domains\\Account\\Users\\000001F5\nSYSTEM\\SAM\\Domains\\Account\\Users\\Names\\Administrator\nSYSTEM\\SAM\\Domains\\Account\\Users\\Names\\Guest', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // /C:/Users/ - Directorios de usuarios
    // ═══════════════════════════════════════════════════════════════
    { path: `/C:/Users/${u}/Desktop/flag.txt`, content: 'THM{USER_ACCESS_GRANTED}', type: 'text' },
    { path: `/C:/Users/${u}/Documents/notes.txt`, content: 'TODO:\n- Update server passwords\n- Check firewall rules\n- Review access logs\n\nAdmin credentials:\nUsername: Administrator\nPassword: P@ssw0rd123!', type: 'text' },
    { path: `/C:/Users/${u}/Documents/web.config`, content: '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <connectionStrings>\n    <add name="DefaultConnection" connectionString="Server=localhost;Database=mydb;User Id=sa;Password=Str0ngP@ss!;" providerName="System.Data.SqlClient" />\n  </connectionStrings>\n  <system.web>\n    <authentication mode="Windows" />\n    <compilation debug="true" targetFramework="4.8" />\n  </system.web>\n</configuration>', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // /C:/inetpub/wwwroot/ - IIS Web Server
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/inetpub/wwwroot/index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>IIS Windows Server</title>\n    <style>\n        body { font-family: Segoe UI, sans-serif; background: #0078d4; color: white; text-align: center; padding: 50px; }\n        h1 { font-size: 48px; }\n        .info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 600px; }\n    </style>\n</head>\n<body>\n    <h1>IIS Windows Server</h1>\n    <div class="info">\n        <p><strong>Internet Information Services</strong></p>\n        <p>This server is running IIS on Windows Server.</p>\n        <p>Document Root: C:\\inetpub\\wwwroot</p>\n    </div>\n</body>\n</html>', type: 'text' },
    { path: '/C:/inetpub/wwwroot/web.config', content: '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n    <system.webServer>\n        <directoryBrowse enabled="false" />\n        <defaultDocument>\n            <files>\n                <add value="index.html" />\n                <add value="Default.htm" />\n                <add value="Default.asp" />\n                <add value="index.htm" />\n                <add value="index.html" />\n                <add value="iisstart.htm" />\n                <add value="default.aspx" />\n            </files>\n        </defaultDocument>\n    </system.webServer>\n</configuration>', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // /C:/xampp/htdocs/ - XAMPP Web Server
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/xampp/htdocs/index.php', content: '<?php\n// XAMPP Default Page\nphpinfo();\n?>', type: 'text' },
    { path: '/C:/xampp/htdocs/config.php', content: '<?php\n// Database Configuration\ndefine("DB_HOST", "localhost");\ndefine("DB_USER", "root");\ndefine("DB_PASS", "toor");\ndefine("DB_NAME", "webapp");\n\n// Admin Credentials\ndefine("ADMIN_USER", "admin");\ndefine("ADMIN_PASS", "admin123");\n?>', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // Archivos de configuración comunes
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/win.ini', content: '[windows]\nload=\nrun=\nNullPort=None\n\n[Desktop]\nWallpaper=(None)\nTileWallpaper=0\nWallpaperStyle=0\n\n[fonts]\n\n[extensions]\n\n[ports]\n\n[mci extensions]\n\n[files]\n\n[Mail]\nMAPI=1\nCMCDLLNAME32=mapi32.dll\nCMC=1\nMAPIX=1\nMAPIXVER=1.0.0.1\nOLEMessaging=1', type: 'text' },

    { path: '/C:/Windows/System32/drivers/etc/protocol', content: '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This file contains the Internet protocols as defined by various\n# RFCs. See http://www.iana.org/assignments/protocol-numbers\n#\n# Format:\n#\n# <protocol name>  <assigned number>  [aliases...]   [# <comment>]\n\nip         0   IP           # Internet protocol, pseudo protocol number\icmp       1   ICMP         # Internet control message protocol\ntcp        6   TCP          # Transmission control protocol\nudp        17  UDP          # User datagram protocol', type: 'text' },

    { path: '/C:/Windows/System32/drivers/etc/services', content: '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This file contains port numbers for well-known services as defined by\n# http://www.iana.org/assignments/port-numbers\n#\n# Format:\n#\n# <service name>  <port number>/<protocol>  [aliases...]   [# <comment>]\n\ntcpmux          1/tcp\nftp-data        20/tcp\nftp             21/tcp\nssh             22/tcp\ntelnet          23/tcp\nsmtp            25/tcp\nhttp            80/tcp\nhttps           443/tcp\nmicrosoft-ds    445/tcp\nmysql           3306/tcp\nms-wbt-server   3389/tcp', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // Archivos de log
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/WindowsUpdate.log', content: '2024-03-19\t10:00:01\tInfo\tWindows Update started\n2024-03-19\t10:00:02\tInfo\tChecking for updates\n2024-03-19\t10:00:05\tInfo\tNo updates available\n2024-03-19\t10:00:06\tInfo\tWindows Update completed', type: 'text' },

    { path: '/C:/Windows/System32/LogFiles/HTTPERR/httperr1.log', content: '#Software: Microsoft HTTP API 2.0\n#Version: 1.0\n#Date: 2024-03-19 10:00:00\n#Fields: date time c-ip c-port s-ip s-port cs-version cs-method cs-uri sc-status s-siteid s-reason s-queuename\n2024-03-19 10:15:30 192.168.1.100 54321 192.168.1.10 80 HTTP/1.1 GET /admin - 401 - Unauthorized -\n2024-03-19 10:15:35 192.168.1.100 54322 192.168.1.10 80 HTTP/1.1 POST /login - 200 - OK -', type: 'text' },

    // ═══════════════════════════════════════════════════════════════
    // Archivos de registro (Registry simulation)
    // ═══════════════════════════════════════════════════════════════
    { path: '/C:/Windows/System32/config/system', content: 'SYSTEM\\ControlSet001\\Control\\ComputerName\\ComputerName\nSYSTEM\\ControlSet001\\Control\\TimeZoneInformation\nSYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters\\Interfaces\nSYSTEM\\ControlSet001\\Services\\LanmanServer\\Shares', type: 'text' },

    { path: '/C:/Windows/System32/config/software', content: 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\nSOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\nSOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce\nSOFTWARE\\Microsoft\\Internet Explorer', type: 'text' },
  ];
}