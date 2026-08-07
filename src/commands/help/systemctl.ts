export const help_systemctl = `systemctl - Control system services

Usage:
  systemctl status [service]
  systemctl start <service>
  systemctl stop <service>
  systemctl restart <service>
  service <name> <status|start|stop|restart>

Examples:
  systemctl status                   # List all services
  systemctl status ssh               # Status of SSH service
  systemctl stop ssh                 # Stop SSH service
  service ssh restart                # SysV alias

Description:
  Manages systemd services. Starting, stopping and restarting
  services requires root privileges. Stopping a service also
  removes its daemon process from 'ps'.`;
