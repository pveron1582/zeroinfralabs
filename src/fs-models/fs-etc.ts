// ── fs-models/fs-etc.ts ────────────────────────────────────────
// Subárbol /etc del filesystem Linux (identidad + configs de sistema)

import type { FileEntry } from '../types';
import type { ExtraLinuxUser } from './fs-linux-types';

type ExtraBlock = (fn: (eu: ExtraLinuxUser, i: number) => string) => string;

/** Construye /etc/passwd, /etc/shadow y /etc/group con usuarios dinámicos. */
export function buildIdentityFiles(u: string, sp: string, extraUsersBlock: ExtraBlock): FileEntry[] {
  return [
    { path: '/etc/passwd', type: 'text', content: `root:x:0:0:root:/root:/bin/bash
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
${u}:x:1000:1000:${u}:/home/${u}:/bin/bash${extraUsersBlock((eu, i) => `${eu.username}:x:${1001 + i}:${1001 + i}:${eu.gecos ?? eu.username}:/home/${eu.username}:${eu.shell ?? '/bin/bash'}`)}
mysql:x:112:118:MySQL Server,,,:/nonexistent:/bin/false
postgres:x:113:119:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
ftp:x:114:121:ftp daemon,,,:/srv/ftp:/usr/sbin/nologin`, owner: 'root', group: 'root', mode: 0o644 },

    { path: '/etc/shadow', type: 'text', content: `root:$6$rounds=656000$YQKGMFNqQvL7JH8d$Hq2yfK8fhj5P9xMpW3vB6nC4dE7gI0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bB0cC1dD2eE3fF4gG5hH6iI:19400:0:99999:7:::
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
${u}:${sp}:19400:0:99999:7:::${extraUsersBlock((eu) => `${eu.username}:${sp}:19400:0:99999:7:::`)}
mysql:!:19400:0:99999:7:::
postgres:$6$rounds=656000$anothersalt$anotherhash9876543210fedcba/0987654321:19400:0:99999:7:::
ftp:*:19400:0:99999:7:::`, owner: 'root', group: 'shadow', mode: 0o640 },

    { path: '/etc/group', content: `root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:sys
adm:x:4:syslog
tty:x:5:
disk:x:6:
lp:x:7:
mail:x:8:
news:x:9:
uucp:x:10:
man:x:12:
proxy:x:13:
kmem:x:15:
dialout:x:20:
fax:x:21:
voice:x:22:
cdrom:x:24:
floppy:x:25:
tape:x:26:
sudo:x:27:
audio:x:29:
dip:x:30:
www-data:x:33:www-data
backup:x:34:
list:x:38:
irc:x:39:
src:x:40:
gnats:x:41:
shadow:x:42:
utmp:x:43:
video:x:44:
sasl:x:45:
plugdev:x:46:
staff:x:50:
games:x:60:
users:x:100:
nogroup:x:65534:
systemd-journal:x:101:
systemd-network:x:102:systemd-network
systemd-resolve:x:103:systemd-resolve
systemd-timesync:x:104:systemd-timesync
messagebus:x:106:messagebus
syslog:x:110:syslog
tss:x:111:tss
uuidd:x:112:uuidd
tcpdump:x:113:tcpdump
ssh:x:114:
landscape:x:115:landscape
admin:x:116:
mysql:x:118:mysql
postgres:x:119:postgres
ftp:x:121:ftp
${u}:x:1000:${extraUsersBlock((eu, i) => `${eu.username}:x:${1001 + i}:`)}`, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ];
}

/** Archivos estáticos de configuración en /etc. */
export const ETC_STATIC_FILES: FileEntry[] = [
    { path: '/etc/hostname', content: 'target-server', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/hosts', content: '127.0.0.1\tlocalhost\n127.0.1.1\ttarget-server\n::1\t\tlocalhost ip6-localhost ip6-loopback\nff02::1\t\tip6-allnodes\nff02::2\t\tip6-allrouters', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/os-release', content: 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 20.04.6 LTS"\nVERSION_ID="20.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\nPRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\nVERSION_CODENAME=focal', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/issue', content: 'Ubuntu 20.04.6 LTS \\n \\l\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/motd', content: '\nWelcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-169-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: Mon Mar 18 14:23:45 2024 from 192.168.1.100\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/resolv.conf', content: '# This file is managed by man:systemd-resolved(8). Do not edit.\n#\n# This is a dynamic resolv.conf file for connecting local clients to the\n# internal DNS stub resolver of systemd-resolved.\nnameserver 127.0.0.53\noptions edns0 trust-ad\nsearch localdomain', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/fstab', content: '# /etc/fstab: static file system information.\n#\n# Use blkid to print the universally unique identifier for a\n# device; this may be used with UUID= as a more robust way to name devices\n# that works even if disks are added and removed.\n# <file system> <mount point>   <type>  <options>       <dump>  <pass>\nUUID=12345678-1234-1234-1234-123456789012 /               ext4    errors=remount-ro 0       1\nUUID=87654321-4321-4321-4321-210987654321 /boot           ext4    defaults        0       2\n/swapfile                                 none            swap    sw              0       0', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/crontab', content: '# /etc/crontab: system-wide crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# Example of job definition:\n# .---------------- minute (0 - 59)\n# |  .------------- hour (0 - 23)\n# |  |  .---------- day of month (1 - 31)\n# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...\n# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat\n# |  |  |  |  |\n# *  *  *  *  * user-name command to be executed\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )\n52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
    { path: '/etc/sudoers', content: '# /etc/sudoers\n# This file MUST be edited with the \'visudo\' command as root.\nDefaults        env_reset\nDefaults        mail_badpass\nDefaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\n# User privilege specification\nroot            ALL=(ALL:ALL) ALL\n\n# Allow members of group sudo to execute any command\n%sudo           ALL=(ALL:ALL) ALL\n%admin          ALL=(ALL:ALL) ALL', type: 'text', owner: 'root', group: 'root', mode: 0o440 },

    // /etc/apache2/
    { path: '/etc/apache2/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/apache2/apache2.conf', content: '# This is the main Apache server configuration file.\nServerRoot "/etc/apache2"\nMutex file:${APACHE_LOCK_DIR} default\nPidFile ${APACHE_PID_FILE}\nTimeout 300\nKeepAlive On\nMaxKeepAliveRequests 100\nKeepAliveTimeout 5\n\n# These need to be set in /etc/apache2/envvars\nUser ${APACHE_RUN_USER}\nGroup ${APACHE_RUN_GROUP}\n\nHostnameLookups Off\nErrorLog ${APACHE_LOG_DIR}/error.log\nLogLevel warn\n\nIncludeOptional mods-enabled/*.load\nIncludeOptional mods-enabled/*.conf\nInclude ports.conf\n\n<Directory />\n\tOptions FollowSymLinks\n\tAllowOverride None\n\tRequire all denied\n</Directory>\n\n<Directory /var/www/>\n\tOptions Indexes FollowSymLinks\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n\nAccessFileName .htaccess\n<FilesMatch "^\\.ht">\n\tRequire all denied\n</FilesMatch>\n\nLogFormat "%v:%p %h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" vhost_combined\nLogFormat "%h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" combined\nLogFormat "%h %l %u %t \\"%r\\" %>s %O" common\n\nIncludeOptional conf-enabled/*.conf\nIncludeOptional sites-enabled/*.conf', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/etc/apache2/ports.conf', content: 'Listen 80\n\n<IfModule ssl_module>\n\tListen 443\n</IfModule>\n\n<IfModule mod_gnutls.c>\n\tListen 443\n</IfModule>', type: 'text', owner: 'root', group: 'root', mode: 0o644 },

    // /etc/ssh/
    { path: '/etc/ssh/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/ssh/sshd_config', content: '# OpenSSH Server Configuration\nPort 22\nAddressFamily any\nListenAddress 0.0.0.0\nListenAddress ::\n\nPermitRootLogin prohibit-password\nPubkeyAuthentication yes\nPasswordAuthentication yes\nPermitEmptyPasswords no\nChallengeResponseAuthentication no\nUsePAM yes\nX11Forwarding yes\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server', type: 'text', owner: 'root', group: 'root', mode: 0o600 },

    // /etc/mysql/
    { path: '/etc/mysql/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/mysql/my.cnf', content: '[mysqld]\npid-file\t= /var/run/mysqld/mysqld.pid\nsocket\t\t= /var/run/mysqld/mysqld.sock\ndatadir\t\t= /var/lib/mysql\nlog-error\t= /var/log/mysql/error.log\n\n# Disabling symbolic-links is recommended to prevent assorted security risks\nsymbolic-links=0\n\n# * IMPORTANT: Additional settings that can override those from this file!\n#   The files must end with \'.cnf\', otherwise they\'ll be ignored.\n!includedir /etc/mysql/conf.d/\n!includedir /etc/mysql/mysql.conf.d/', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
];
