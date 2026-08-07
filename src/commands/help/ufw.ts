export const help_ufw = `ufw - Uncomplicated Firewall

Usage:
  ufw status                         # Show status and rules
  ufw enable                         # Enable firewall (default deny)
  ufw disable                        # Disable firewall
  ufw allow <service>                # Allow port/service (e.g. 22/tcp, ssh)
  ufw deny <service>                 # Deny port/service
  ufw delete <service>               # Delete a rule

Examples:
  ufw enable
  ufw allow 22/tcp
  ufw deny 80

Description:
  Frontend over iptables. When enabled, incoming traffic is denied by
  default and only allowed rules open ports. Requires root.`;
