export const help_iptables = `iptables - Manage firewall rules

Usage:
  iptables -L [chain]               # List rules
  iptables -A <chain> <rulespec>    # Append rule
  iptables -D <chain> <rulenum>     # Delete rule by number
  iptables -F [chain]               # Flush rules
  iptables -P <chain> <target>      # Set default policy (DROP/ACCEPT)

Examples:
  iptables -L
  iptables -A INPUT -p tcp --dport 22 -j DROP
  iptables -P INPUT DROP
  iptables -D INPUT 1

Description:
  Manages netfilter firewall rules. DROP/REJECT rules make nmap/ss
  report the affected ports as filtered. Requires root.`;
