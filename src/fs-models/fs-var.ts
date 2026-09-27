// ── fs-models/fs-var.ts ────────────────────────────────────────
// Subárbol /var del filesystem Linux (logs, webroot)

import type { FileEntry } from '../types';
import { MACHINE_HOSTNAME_PLACEHOLDER } from './placeholders';

export const VAR_FILES: FileEntry[] = [
    { path: '/var/log/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/www/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/lib/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/mail/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/spool/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/backups/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/cache/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/var/run/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },

    // Logs de sistema: solo narrativa neutra (apt, cron, kernel). El detalle
    // de sesión/ssh/sudo de cada laboratorio lo agrega el labo correspondiente
    // — el modelo no cuenta historias de usuarios ni usa IPs de escenario.
    // El hostname lo inyecta buildScenario (placeholder MACHINE_HOSTNAME).
    { path: '/var/log/syslog', content: `Mar 19 10:00:01 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd[1]: Started Daily apt download activities.\nMar 19 10:00:01 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd[1]: Starting Daily apt download activities...\nMar 19 10:00:02 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd[1]: apt-daily.service: Succeeded.\nMar 19 10:15:01 ${MACHINE_HOSTNAME_PLACEHOLDER} CRON[2345]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)\nMar 19 10:17:01 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd[1]: Starting Clean php session files...\nMar 19 10:17:01 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd[1]: phpsessionclean.service: Succeeded.`, type: 'text', owner: 'root', group: 'adm', mode: 0o640 },
    { path: '/var/log/auth.log', content: `Mar 19 10:00:01 ${MACHINE_HOSTNAME_PLACEHOLDER} systemd-logind[567]: New session c1 of user root.\nMar 19 10:15:01 ${MACHINE_HOSTNAME_PLACEHOLDER} CRON[2345]: pam_unix(cron:session): session opened for user root by (uid=0)\nMar 19 10:15:01 ${MACHINE_HOSTNAME_PLACEHOLDER} CRON[2345]: pam_unix(cron:session): session closed for user root`, type: 'text', owner: 'root', group: 'adm', mode: 0o640 },
    { path: '/var/log/kern.log', content: `Mar 19 10:00:00 ${MACHINE_HOSTNAME_PLACEHOLDER} kernel: [    0.000000] Linux version 5.4.0-169-generic (buildd@lcy02-amd64-029) (gcc version 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.2)) #187-Ubuntu SMP Thu Nov 23 14:52:28 UTC 2023\nMar 19 10:00:00 ${MACHINE_HOSTNAME_PLACEHOLDER} kernel: [    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.4.0-169-generic root=UUID=12345678-1234-1234-1234-123456789012 ro quiet splash\nMar 19 10:00:00 ${MACHINE_HOSTNAME_PLACEHOLDER} kernel: [    0.000000] KERNEL supported cpus:`, type: 'text', owner: 'root', group: 'adm', mode: 0o640 },

    // /var/www/html/
    { path: '/var/www/html/.dir', content: '', type: 'text', owner: 'www-data', group: 'www-data', mode: 0o755 },
    { path: '/var/www/html/index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Apache2 Ubuntu Default Page</title>\n    <style>\n        body { font-family: Ubuntu, sans-serif; background: #f5f5f5; margin: 0; padding: 40px; }\n        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n        h1 { color: #333; border-bottom: 2px solid #e95420; padding-bottom: 10px; }\n        .info { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Apache2 Ubuntu Default Page</h1>\n        <p><strong>It works!</strong></p>\n        <p>This is the default welcome page used to test the correct operation of the Apache2 server.</p>\n        <div class="info">\n            <strong>Server Information:</strong><br>\n            Server Version: Apache/2.4.41 (Ubuntu)<br>\n            Document Root: /var/www/html<br>\n            Configuration: /etc/apache2/apache2.conf\n        </div>\n        <p>If you can read this page, it means that the Apache HTTP server installed at this site is working properly.</p>\n    </div>\n</body>\n</html>', type: 'text', owner: 'www-data', group: 'www-data', mode: 0o644 },
    // Sin .htaccess en el docroot: Apache de fábrica no lo trae y el de la
    // plantilla tenía rewrite de WordPress (CMS del lab 01, no del SO).
];
